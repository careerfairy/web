import {
   createCompatGenericConverter,
   mapFirestoreDocuments,
} from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import {
   FilterCompanyOptions,
   GROUP_DASHBOARD_ROLE,
   Group,
   GroupAdmin,
   GroupPlanType,
   GroupQuestion,
} from "@careerfairy/shared-lib/groups"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"
import { GroupDashboardInvite } from "@careerfairy/shared-lib/groups/GroupDashboardInvite"
import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/groups/GroupRepository"
import { getPlanConstants } from "@careerfairy/shared-lib/groups/planConstants"
import { createGroupStatsDoc } from "@careerfairy/shared-lib/groups/stats"
import { GroupEventServer } from "@careerfairy/shared-lib/groups/telemetry"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { groupTriGrams } from "@careerfairy/shared-lib/utils/search"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { firestore } from "firebase-admin"
import { UserRecord } from "firebase-admin/auth"
import { Change } from "firebase-functions"
import { cloneDeep, isEmpty, union } from "lodash"
import { DateTime } from "luxon"
import { Timestamp, auth } from "../api/firestoreAdmin"
import type { FunctionsLogger } from "../util"
import { getWebBaseUrl } from "../util"
import BigQueryCreateInsertService from "./bigQuery/BigQueryCreateInsertService"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   EmailNotificationRequestData,
} from "./notifications/EmailTypes"
import { INotificationService } from "./notifications/NotificationService"
import {
   addGroupStatsOperations,
   addOperationsToDecrementGroupStatsOperations,
   addOperationsToOnlyIncrementGroupStatsOperations,
} from "./stats/group"
import { OperationsToMake } from "./stats/util"
import DocumentSnapshot = firestore.DocumentSnapshot

export interface IGroupFunctionsRepository extends IGroupRepository {
   /**
    * Confirm if user is admin of the group
    *
    * Returns true if user is admin of the group and the group itself to save a
    * network request in case you need to fetch the full group afterwards
    * @param groupId
    * @param userEmail
    */
   checkIfUserIsGroupAdmin(
      groupId: string,
      userEmail: string
   ): Promise<{ isAdmin: boolean; group: Group; role: GROUP_DASHBOARD_ROLE }>

   /**
    * Grants or removes a user admin access to a group and a role
    *
    * What it does if a role is provided:
    * 1. Assigns a role to the group in the user's auth custom claims
    * 2. Adds the user's role to the group's admins sub-collection list for querying of group admins in group/[groupId]/admin/roles
    * 3. Adds a userGroupAdmin document to the user's userAdminGroups sub-collection with the group's details
    *
    * What it does if no role is provided:
    * 1. Removes the user's role from the group's admins sub-collection list for querying of group admins in group/[groupId]/admin/roles
    * 2. Removes the user's role from the user's auth custom claims
    * 3. Removes the user's userGroupAdmin document from the user's userAdminGroups sub-collection
    * @param email
    * @param group
    * @param role
    */
   setAdminRole(
      email: string,
      group: Group,
      role: GROUP_DASHBOARD_ROLE | null
   ): Promise<void>

   createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<GroupDashboardInvite>

   deleteGroupDashboardInviteById(id: string): Promise<void>

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      currentUserEmail: string
   ): boolean

   createGroup(
      group: Partial<Group>,
      userEmail: string,
      groupQuestions?: GroupQuestion[]
   ): Promise<Group>

   /*
    * This method will return the invitation document if it exists for the given email
    * */
   getDashboardInvite(emailToCheck: string): Promise<GroupDashboardInvite>

   getATSIntegration(
      groupId: string,
      integrationId: string
   ): Promise<GroupATSAccount>

   addOperationsToGroupStats(
      change: Change<DocumentSnapshot>,
      logger: FunctionsLogger
   ): Promise<void>

   /**
    * To generate the newsletter, we need to fetch all
    * the associations between users and companies
    */
   getAllCompaniesFollowers(): Promise<CompanyFollowed[] | null>

   /**
    * Fetches companies based on the filters provided in @param options .
    * @param options Supported filters, more can be added
    */
   fetchCompanies(
      options: FilterCompanyOptions,
      useCoumpoundQueries?: boolean,
      allCompanyIndustries?: OptionGroup[]
   ): Promise<Group[]>

   /**
    * Starts a plan for a group.
    *
    * This method sets the 'plan' field of the group document to the specified plan type and sets the 'startedAt' field to the current time.
    * The 'expiresAt' field is set to the current time plus the duration of the plan.
    *
    * @param groupId - The ID of the group for which the plan is to be started.
    * @param planType - The type of the plan to be started.
    * @returns A promise that resolves when the plan has been successfully started.
    */
   startPlan(groupId: string, plan: GroupPlanType): Promise<void>

   /**
    * Stops a plan for a group.
    *
    * This method sets the 'expiresAt' field of the group's plan to the current time, effectively making the plan expired immediately.
    *
    * @param groupId - The ID of the group for which the plan is to be stopped.
    * @returns A promise that resolves when the plan has been successfully stopped.
    */
   stopPlan(groupId: string): Promise<void>

   /**
    * Sends a Sparks trial welcome email.
    *
    * This method fetches all the group admins of the given group and sends a batch of emails through Postmark.
    *
    * @param groupId - The ID of the group to send the email to.
    * @param client - The Postmark client.
    * @returns A promise that resolves when the email was sent.
    */
   sendTrialWelcomeEmail(
      groupId: string,
      companyName: string,
      client: INotificationService
   ): Promise<void>

   /**
    * Fetches all groups that are on a plan.
    *
    * @returns A promise that resolves with an array of Group objects.
    */
   getAllGroupsWithAPlan(): Promise<Group[]>

   /**
    * Retrieves all groups which have a plan expiring, taking into account a number of days as buffer. The retrieves groups shall be
    * those which have plan.expiresAt <= Now() + days.
    * @param type Type of plan to restrict groups by
    * @param ignoreGroupIds List of groups to be ignored from query results (not in)
    */
   getAllGroupsWithAPlanExpiring(
      types: GroupPlanType[],
      days: number,
      logger: Logger,
      ignoreGroupIds?: string[]
   ): Promise<Group[]>

   /**
    * Sends a reminder email to the group admins when the trial plan creation period is near to end.
    *
    * This method fetches all the group admins of the given group and sends a batch of reminder emails through Postmark.
    *
    * @param group - The group for which the reminder email is to be sent.
    * @param client - The Postmark client.
    * @returns A promise that resolves when the reminder email was sent.
    */
   sendTrialPlanCreationPeriodInCriticalStateReminder(
      group: Group,
      client: INotificationService
   ): Promise<void>

   trackGroupEvents(events: GroupEventServer[]): Promise<void>
}

export class GroupFunctionsRepository
   extends FirebaseGroupRepository
   implements IGroupFunctionsRepository
{
   private groupEventsHandler: BigQueryCreateInsertService<GroupEventServer>
   setGroupEventsHandler(
      handler: BigQueryCreateInsertService<GroupEventServer>
   ) {
      this.groupEventsHandler = handler
      return this
   }

   async getAllCompaniesFollowers(): Promise<CompanyFollowed[] | null> {
      const docs = await this.firestore
         .collectionGroup("companiesUserFollows")
         .get()

      return mapFirestoreDocuments<CompanyFollowed, false>(docs)
   }

   async checkIfUserIsGroupAdmin(
      groupId: string,
      userEmail: string
   ): Promise<{ isAdmin: boolean; group: Group; role: GROUP_DASHBOARD_ROLE }> {
      const groupDoc = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .get()

      if (!groupDoc.exists) {
         return { isAdmin: false, group: null, role: null }
      }

      const group = this.addIdToDoc<Group>(groupDoc)
      const user = await auth.getUserByEmail(userEmail)

      const userRole = user.customClaims?.adminGroups?.[group.id]?.role

      return {
         isAdmin: Object.values(GROUP_DASHBOARD_ROLE).includes(userRole),
         group,
         role: userRole,
      }
   }

   async setAdminRole(
      targetEmail: string,
      group: Group,
      newRole: GROUP_DASHBOARD_ROLE | null
   ) {
      // Get the auth user
      const userSnap = await this.firestore
         .collection("userData")
         .doc(targetEmail)
         .get()

      const userData = this.addIdToDoc<UserData>(userSnap)

      const user = await auth.getUserByEmail(targetEmail)

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER FOR EVERY GROUP AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            group.id,
            newRole,
            targetEmail
         )

      if (!thereWillBeAtLeastOneOwner) {
         throw new Error(
            "Cannot remove the last owner of the group. There must be at least one owner."
         )
      }

      await this.setGroupAdminRoleInClaims(user, newRole, group)

      return this.setGroupAdminRoleInFirestore(group, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            void auth.setCustomUserClaims(user.uid, user.customClaims)
            throw error
         }
      )
   }

   async fetchCompanies(
      options: FilterCompanyOptions,
      useCoumpoundQueries?: boolean,
      allCompanyIndustries?: OptionGroup[]
   ): Promise<Group[]> {
      let q = this.firestore
         .collection("careerCenterData")
         .orderBy("normalizedUniversityName")
         .withConverter(
            createCompatGenericConverter<Group>()
         ) as unknown as FirebaseFirestore.Query<Group>

      q = applyCompanyFilters(
         q,
         options,
         useCoumpoundQueries,
         allCompanyIndustries
      )
      const snaps = await q.get()
      return snaps.docs.map((d) => d.data())
   }
   /*
    * Stores the group admin role in the user's custom claims
    * */
   protected async setGroupAdminRoleInClaims(
      authUser: UserRecord,
      newRole: GROUP_DASHBOARD_ROLE | null,
      group: Group
   ) {
      const oldClaims = { ...authUser.customClaims }
      let newClaims = JSON.parse(JSON.stringify(oldClaims)) // deep copy the old claims

      if (newRole) {
         newClaims = {
            ...oldClaims,
            adminGroups: {
               ...oldClaims.adminGroups,
               [group.id]: {
                  role: newRole,
               },
            },
         }
      } else {
         // remove the role from the user's custom claims
         if (newClaims.adminGroups?.[group.id]) {
            delete newClaims.adminGroups[group.id]
         }
      }

      return auth.setCustomUserClaims(authUser.uid, newClaims)
   }

   async getGroupAdmins(groupId: string): Promise<GroupAdmin[]> {
      const adminsSnap = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupAdmins")
         .get()

      return mapFirestoreDocuments(adminsSnap)
   }

   async createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<GroupDashboardInvite> {
      const id = this.firestore.collection("invites").doc().id
      const invite: GroupDashboardInvite = {
         id,
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-ignore
         createdAt: this.fieldValue.serverTimestamp(),
         invitedEmail: userEmail,
         groupId,
         role: role || GROUP_DASHBOARD_ROLE.MEMBER,
      }
      await this.firestore
         .collection("groupDashboardInvites")
         .doc(id)
         .set(invite)
      return invite
   }

   deleteGroupDashboardInviteById(inviteId: string): Promise<void> {
      return this.firestore
         .collection("groupDashboardInvites")
         .doc(inviteId)
         .delete()
   }

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      currentUserEmail: string
   ): boolean {
      return Boolean(
         groupDashboardInvite.invitedEmail &&
            groupDashboardInvite.groupId &&
            groupDashboardInvite.role &&
            currentUserEmail
      )
   }

   async createGroup(
      group: Partial<Group>,
      userEmail: string,
      groupQuestions?: GroupQuestion[]
   ): Promise<Group> {
      const batch = this.firestore.batch()

      // Create group ref
      const groupRef = this.firestore.collection("careerCenterData").doc()
      // Create user's reference in th group admins sub-collection

      // add the group questions to the the the groupQuestions sub-collection
      const questionsWithoutTempIds = removeTempGroupQuestionIds(groupQuestions)
      const questionRefs = []

      questionsWithoutTempIds.forEach((groupQuestion) => {
         const groupQuestionRef = this.firestore
            .collection("careerCenterData")
            .doc(groupRef.id)
            .collection("groupQuestions")
            .doc()
         questionRefs.push(groupQuestionRef)
         batch.set(groupQuestionRef, groupQuestion)
      })

      const newGroupData: Group = {
         id: groupRef.id,
         groupId: groupRef.id,
         description: group.description || "",
         logoUrl: group.logoUrl || "",
         universityName: group.universityName || "",
         universityCode: group.universityCode || "",
         atsAdminPageFlag: group.atsAdminPageFlag || false,
         companyCountry: group.companyCountry || null,
         companyIndustries: group.companyIndustries || [],
         companySize: group.companySize || "",
         test: false,
         triGrams: groupTriGrams(group.universityName || ""),
      }

      batch.set(groupRef, newGroupData)

      // create group stats
      const groupStatsRef = groupRef.collection("stats").doc("groupStats")
      const statsDoc = createGroupStatsDoc(newGroupData, newGroupData.id)
      batch.set(groupStatsRef, statsDoc)

      await batch.commit().then(() =>
         this.setAdminRole(
            userEmail,
            newGroupData,
            GROUP_DASHBOARD_ROLE.OWNER
         ).catch((error) => {
            // if there was an error, delete the group and its questions
            const batch = this.firestore.batch()
            batch.delete(groupRef)
            questionRefs.forEach((questionRef) => {
               batch.delete(questionRef)
            })
            void batch.commit()
            throw error
         })
      )
      return newGroupData
   }

   async getDashboardInvite(
      emailToCheck: string
   ): Promise<GroupDashboardInvite> {
      const docs = await this.firestore
         .collection("groupDashboardInvites")
         .where("invitedEmail", "==", emailToCheck)
         .limit(1)
         .get()

      if (docs.size !== 1) return null

      return this.addIdToDoc<GroupDashboardInvite>(docs.docs[0])
   }

   async getATSIntegration(
      groupId: string,
      integrationId: string
   ): Promise<GroupATSAccount> {
      const doc = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)
         .get()

      if (!doc.exists) return null

      return GroupATSAccount.createFromDocument({
         ...doc.data(),
         id: integrationId,
      } as any)
   }

   async updateGroupStats(
      groupId: string,
      operationsToMake: OperationsToMake
   ): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const groupStatsRef = groupRef.collection("stats").doc("groupStats")

      const groupDoc = await groupRef.get()

      if (!groupDoc.exists) {
         return // Group was deleted, no need to update the stats
      }

      const statsSnap = await groupStatsRef.get()

      if (!statsSnap.exists) {
         // Create the stats document
         const statsDoc = createGroupStatsDoc(
            this.addIdToDoc<Group>(groupDoc),
            groupStatsRef.id
         )
         await groupStatsRef.set(statsDoc)
      }

      // We have to use an update method here because the set method does not support nested updates/operations
      return groupStatsRef.update(operationsToMake)
   }

   async addOperationsToGroupStats(
      change: Change<DocumentSnapshot>,
      logger: FunctionsLogger
   ): Promise<void> {
      const newLivestreamStats = change.after.data() as LiveStreamStats
      const oldLivestreamStats = change.before.data() as LiveStreamStats

      const operationsToMake: OperationsToMake = {} // An empty object to store the update operations for the firestore UPDATE operation

      // Add operations for the general stats
      addGroupStatsOperations(
         newLivestreamStats,
         oldLivestreamStats,
         operationsToMake
      )

      const allPossibleGroupIds = union(
         newLivestreamStats?.livestream?.groupIds,
         oldLivestreamStats?.livestream?.groupIds
      )

      const promises = []

      for (const groupId of allPossibleGroupIds) {
         const groupOperationsToMake: OperationsToMake =
            cloneDeep(operationsToMake)

         const groupHasBeenRemovedFromLivestream =
            !newLivestreamStats?.livestream?.groupIds?.includes(groupId)

         const groupHasBeenAddedToLivestream =
            !oldLivestreamStats?.livestream?.groupIds?.includes(groupId)

         if (groupHasBeenRemovedFromLivestream) {
            addOperationsToDecrementGroupStatsOperations(
               newLivestreamStats,
               oldLivestreamStats,
               groupOperationsToMake
            )
         }

         if (groupHasBeenAddedToLivestream) {
            addOperationsToOnlyIncrementGroupStatsOperations(
               newLivestreamStats,
               oldLivestreamStats,
               groupOperationsToMake
            )
         }

         // Check if there are any updates to livestreamStats
         if (isEmpty(groupOperationsToMake)) {
            logger.info(`No changes to group stats ${groupId}`, {
               groupId,
               groupOperationsToMake,
            })
         } else {
            promises.push(
               // Perform a Firestore transaction to update group stats
               this.updateGroupStats(groupId, groupOperationsToMake).then(
                  () => {
                     logger.info(
                        "Updated group stats with the following operations",
                        {
                           groupId,
                           groupOperationsToMake,
                        }
                     )
                  }
               )
            )
         }
      }

      return Promise.allSettled(promises).then((results) => {
         results.forEach((result) => {
            if (result.status === "rejected") {
               logger.error("Error updating group stats", {
                  error: result.reason,
                  result: result,
               })
            }
         })
      })
   }

   async startPlan(groupId: string, planType: GroupPlanType): Promise<void> {
      const groupRef = this.firestore
         .collection(this.COLLECTION_NAME)
         .doc(groupId)

      const now = Timestamp.now()

      const expiresAt = Timestamp.fromMillis(
         now.toMillis() +
            getPlanConstants(planType).sparks.PLAN_DURATION_MILLISECONDS
      )

      const toUpdate: Pick<
         Group,
         "plan" | "sparksAdminPageFlag" | "publicSparks"
      > = {
         plan: {
            type: planType,
            startedAt: now,
            expiresAt,
         },
         sparksAdminPageFlag: true,
         publicSparks: true,
      }

      return groupRef.update(toUpdate)
   }

   async stopPlan(groupId: string): Promise<void> {
      const groupRef = this.firestore
         .collection(this.COLLECTION_NAME)
         .doc(groupId)

      return groupRef.update({ "plan.expiresAt": Timestamp.now() })
   }

   async sendTrialWelcomeEmail(
      groupId: string,
      companyName: string,
      client: INotificationService
   ): Promise<void> {
      const admins = await this.getGroupAdmins(groupId)

      return sendSparksTrialPlanEmail({
         client,
         admins,
         templateId: CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_START_SUBSCRIPTION,
         content: "trial_welcome",
         companyName,
      })
   }

   async getAllGroupsWithAPlan(): Promise<Group[]> {
      const snaps = await this.firestore
         .collection("careerCenterData")
         .orderBy("plan")
         .withConverter(createCompatGenericConverter<Group>())
         .get()

      return mapFirestoreDocuments<Group>(snaps)
   }

   async getAllGroupsWithAPlanExpiring(
      types: GroupPlanType[],
      days: number,
      logger: Logger,
      ignoreGroupIds: string[] = []
   ): Promise<Group[]> {
      const preExpirationDate = DateTime.now().plus({ days: days }).toJSDate()
      logger.info(
         " - getAllGroupsWithAPlanExpiring using expiration date -> ",
         preExpirationDate
      )
      const query = this.firestore
         .collection("careerCenterData")
         .where("plan.type", "in", types)
         .where("plan.expiresAt", "<=", preExpirationDate)
      const snaps = await query
         .orderBy("plan.expiresAt")
         .withConverter(createCompatGenericConverter<Group>())
         .get()
      return mapFirestoreDocuments<Group>(snaps)?.filter(
         (group) => !ignoreGroupIds.includes(group.groupId)
      )
   }

   async sendTrialPlanCreationPeriodInCriticalStateReminder(
      group: Group,
      client: INotificationService
   ): Promise<void> {
      const admins = await this.getGroupAdmins(group.id)

      return sendSparksTrialPlanEmail({
         client,
         admins,
         templateId:
            CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_CONTENT_CREATION_PERIOD,
         companyName: group.universityName,
         content: "trial_contentcreation_end",
      })
   }

   async trackGroupEvents(groupEvents: GroupEventServer[]) {
      if (!this.groupEventsHandler) {
         throw new Error("Group events handler not set")
      }

      return this.groupEventsHandler.insertData(groupEvents)
   }
}

const removeTempGroupQuestionIds = (groupQuestions?: GroupQuestion[]) => {
   return (
      groupQuestions?.map((groupQuestion) => {
         delete groupQuestion.id
         return groupQuestion
      }) || []
   )
}

const applyCompanyFilters = (
   query: FirebaseFirestore.Query<Group>,
   filters: FilterCompanyOptions,
   useCompound?: boolean,
   allCompanyIndustries?: OptionGroup[]
): FirebaseFirestore.Query<Group> => {
   /**
    * The filter for @field publicSparks is only applied when value == true, filtering for 'true' only.
    * Otherwise the filter is not applied, meaning filtering for companies which have publicSparks == false or any
    * value is not possible when using this filter.
    * This is intended.
    */
   if (filters.publicSparks) {
      query = query.where("publicSparks", "==", true)
   }

   if (useCompound) {
      if (filters.companyCountries?.length > 0) {
         query = query.where(
            "companyCountry.id",
            "in",
            filters.companyCountries
         )
      }

      if (filters.companySize?.length > 0) {
         query = query.where("companySize", "in", filters.companySize)
      }

      if (filters.companyIndustries?.length > 0) {
         const mappedFilters = formatToOptionArray(
            filters.companyIndustries,
            allCompanyIndustries
         )
         query = mappedFilters.length
            ? query.where(
                 "companyIndustries",
                 "array-contains-any",
                 mappedFilters
              )
            : query
      }
   }

   query = query.where("publicProfile", "==", true)
   query = query.where("test", "==", false)

   return query
}

const formatToOptionArray = (
   selectedIds: string[],
   allOptions: OptionGroup[]
): OptionGroup[] => {
   return allOptions
      .map((option) => {
         return { ...option, id: option.id.replace("_", ",") }
      })
      .filter(({ id }) => selectedIds?.includes(id))
}

type ValidTemplateId =
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_START_SUBSCRIPTION
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_SUBSCRIPTION
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_CONTENT_CREATION_PERIOD

type SendSparksTrialPlanEmailProps = {
   client: INotificationService
   admins: GroupAdmin[]
   templateId: ValidTemplateId
   content: string
   companyName: string
}

const sendSparksTrialPlanEmail = async ({
   client,
   admins,
   templateId,
   content,
   companyName,
}: SendSparksTrialPlanEmailProps) => {
   if (admins) {
      const emails = admins.map<EmailNotificationRequestData<ValidTemplateId>>(
         ({ email, groupId }) => ({
            templateData: {
               company_sparks_link: addUtmTagsToLink({
                  link: `${getWebBaseUrl()}/group/${groupId}/admin/sparks`,
                  campaign: "sparks",
                  content,
               }),
               ...(companyName && { company_name: companyName }),
               company_plan: "Sparks",
            },
            templateId,
            to: email,
            identifiers: {
               email,
            },
         })
      )

      await client.sendEmailNotifications(emails)
   }

   return
}
