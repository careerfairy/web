import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/groups/GroupRepository"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
   GroupPlan,
   GroupPlanType,
   GroupQuestion,
} from "@careerfairy/shared-lib/groups"
import { GroupDashboardInvite } from "@careerfairy/shared-lib/groups/GroupDashboardInvite"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"
import { Change } from "firebase-functions"
import { firestore } from "firebase-admin"
import { OperationsToMake } from "./stats/util"
import { createGroupStatsDoc } from "@careerfairy/shared-lib/groups/stats"
import { cloneDeep, isEmpty, union } from "lodash"
import {
   addGroupStatsOperations,
   addOperationsToDecrementGroupStatsOperations,
   addOperationsToOnlyIncrementGroupStatsOperations,
} from "./stats/group"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import type { FunctionsLogger } from "../util"

import DocumentSnapshot = firestore.DocumentSnapshot
import { groupTriGrams } from "@careerfairy/shared-lib/utils/search"
import { auth, Timestamp } from "../api/firestoreAdmin"
import { UserRecord } from "firebase-admin/auth"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { getPlanConstants } from "@careerfairy/shared-lib/groups/planConstants"

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
    * To sync the connection between the livestream and the pre-existing custom jobs within the group document
    */
   syncLivestreamIdWithCustomJobs(
      livestream: Change<DocumentSnapshot>
   ): Promise<void>

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
}

export class GroupFunctionsRepository
   extends FirebaseGroupRepository
   implements IGroupFunctionsRepository
{
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
            auth.setCustomUserClaims(user.uid, user.customClaims)
            throw error
         }
      )
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
            batch.commit()
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

   async syncLivestreamIdWithCustomJobs(
      livestream: Change<DocumentSnapshot>
   ): Promise<void> {
      const batch = this.firestore.batch()
      const newLivestream = livestream.after?.data() as LivestreamEvent
      const previousLivestream = livestream.before?.data() as LivestreamEvent

      const groupId =
         newLivestream?.groupIds?.[0] || previousLivestream?.groupIds?.[0]
      const livestreamId = newLivestream?.id || previousLivestream?.id

      const newJobs = newLivestream?.customJobs || []
      const oldJobs = previousLivestream?.customJobs || []

      // To get a list of jobs that have been removed as a result of this update or deletion action
      const jobsToRemoveLivestreamId = oldJobs.filter(
         ({ id: oldJobId }) =>
            !newJobs.some(({ id: newJobId }) => newJobId === oldJobId)
      )

      // To get a list of jobs that have been added as a result of this update or creation action
      const jobsToAddLivestreamId = newJobs.filter(
         ({ id: newJobId }) =>
            !oldJobs.some(({ id: oldJobId }) => oldJobId === newJobId)
      )

      if (Boolean(!groupId) || Boolean(!livestreamId)) {
         // If there are no valid group id or livestream id at this moment, no additional work is required
         return
      }

      if (
         jobsToAddLivestreamId.length === 0 &&
         jobsToRemoveLivestreamId.length === 0
      ) {
         // If there are no jobs to be added or removed, it indicates that no changes have been made to the custom job field
         // so no additional work is required
         return
      }

      jobsToAddLivestreamId.forEach((job) => {
         const ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("customJobs")
            .doc(job.id)

         batch.update(ref, {
            livestreams: this.fieldValue.arrayUnion(livestreamId),
         })
      })

      jobsToRemoveLivestreamId.forEach((job) => {
         const ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("customJobs")
            .doc(job.id)

         batch.update(ref, {
            livestreams: this.fieldValue.arrayRemove(livestreamId),
         })
      })

      return await batch.commit()
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

      const toUpdate: Pick<Group, "plan" | "sparksAdminPageFlag"> = {
         plan: {
            type: planType,
            startedAt: now,
            expiresAt,
         },
         sparksAdminPageFlag: true,
      }

      return groupRef.update(toUpdate)
   }

   async stopPlan(groupId: string): Promise<void> {
      const groupRef = this.firestore
         .collection(this.COLLECTION_NAME)
         .doc(groupId)

      return groupRef.update({ "plan.expiresAt": Timestamp.now() })
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
