import firebase from "firebase/compat/app"
import { uniqBy } from "lodash"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
   mapFirestoreDocuments,
   OnSnapshotCallback,
   Unsubscribe,
} from "../BaseFirebaseRepository"
import { Create, ImageType } from "../commonTypes"
import { CustomJob } from "../customJobs/customJobs"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
   Speaker,
} from "../livestreams"
import { Spark } from "../sparks/sparks"
import {
   CompanyFollowed,
   pickPublicDataFromUser,
   UserAdminGroup,
   UserData,
} from "../users"
import { containsAny } from "../utils/utils"
import {
   AddCreatorData,
   Creator,
   CreatorPublicContent,
   CreatorRole,
   CreatorWithContent,
   PublicCreator,
   transformCreatorNameIntoSlug,
   UpdateCreatorData,
} from "./creators"
import { GroupDashboardInvite } from "./GroupDashboardInvite"
import { MAX_GROUP_PHOTOS_COUNT } from "./GroupPresenter"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
   GroupATSAccountDocument,
   GroupATSIntegrationTokensDocument,
   GroupPhoto,
   GroupQuestion,
   GroupVideo,
   pickPublicDataFromGroup,
   PublicGroup,
   Testimonial,
   UserGroupData,
} from "./groups"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloneDeep = require("lodash.clonedeep")

export interface IGroupRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>

   getGroupsByIds(groupIds: string[]): Promise<Group[]>

   getGroupById(groupId: string): Promise<Group>

   getAdminGroups(
      userEmail: string,
      isAdmin: boolean
   ): Promise<Group[] | UserAdminGroup[]>

   cleanAndSerializeGroup(
      group: Group
   ): Omit<Group, "adminEmails" | "adminEmail">

   // ATS actions
   getATSIntegrations(groupId: string): Promise<GroupATSAccountDocument[]>

   removeATSIntegration(groupId: string, integrationId: string): Promise<void>

   createATSIntegration(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSAccountDocument>
   ): Promise<void>

   saveATSIntegrationTokens(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSIntegrationTokensDocument>
   ): Promise<void>

   /**
    * Should only be called from backends
    * @param groupId
    * @param integrationId
    */
   getATSIntegrationTokens(
      groupId: string,
      integrationId: string
   ): Promise<GroupATSIntegrationTokensDocument>

   getGroupQuestions(groupId: string): Promise<GroupQuestion[]>

   addNewGroupQuestion(
      groupId: string,
      groupQuestion: Create<GroupQuestion>
   ): Promise<GroupQuestion>

   updateGroupQuestion(
      groupId: string,
      groupQuestion: GroupQuestion
   ): Promise<void>

   deleteGroupQuestion(groupId: string, groupQuestionId: string): Promise<void>

   listenToGroupQuestions(
      groupId: string,
      callback: OnSnapshotCallback<GroupQuestion>
   ): Unsubscribe

   getFieldOrLevelOfStudyGroupQuestion(
      groupId: string,
      questionType: Exclude<GroupQuestion["questionType"], "custom">
   ): Promise<GroupQuestion>

   getAllPublicProfileGroups(): Promise<Group[]>

   getGroupCustomQuestionsQuery(
      groupId: string
   ): firebase.firestore.Query<firebase.firestore.DocumentData>

   mapUserAnswersToLivestreamGroupQuestions(
      userData: UserData,
      livestream: LivestreamEvent
   ): Promise<LivestreamGroupQuestionsMap>

   getUserGroupDataByGroupId(userEmail: string, groupId): Promise<UserGroupData>

   getAllUserGroupDataIds(userEmail: string): Promise<string[]>

   deleteUserGroupData(userEmail: string, groupId: string): Promise<void>

   getGroupDashboardInviteById(id: string): Promise<GroupDashboardInvite>

   /*
    * Stores the user's admin data in firestore two places:
    * 1. On the group's admin sub-collection at careerCenterData/[groupId]/groupAdmins/[userEmail] with the role and display info
    * 2. On the user's userAdminGroups sub-collection at userData/[userEmail]/userAdminGroups/[groupId] with the group's display info
    * */
   setGroupAdminRoleInFirestore(
      group: Group,
      userData: Pick<UserData, "id" | "userEmail" | "firstName" | "lastName">,
      role?: GROUP_DASHBOARD_ROLE
   ): Promise<void>

   /*
    * Gets the admins of a group document
    * */
   getGroupAdmins(groupId: string): Promise<GroupAdmin[]>

   groupAvailableCustomJobsQuery(
      groupId: string
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   getGroupAvailableCustomJobs(groupId: string): Promise<CustomJob[]>

   getGroupByGroupName(groupName: string): Promise<Group>

   updateGroupMetadata(
      groupId: string,
      metadata: Pick<
         Group,
         | "extraInfo"
         | "companySize"
         | "companyIndustries"
         | "companyCountry"
         | "targetedCountries"
         | "targetedUniversities"
         | "targetedFieldsOfStudy"
         | "privacyPolicyActive"
         | "privacyPolicyUrl"
         | "universityName"
         | "normalizedUniversityName"
         | "careerPageUrl"
      >
   ): Promise<void>

   updateGroupTestimonials(groupId: string, testimonials: Testimonial[])

   updateGroupPhotos(
      groupId: string,
      newPhotos: GroupPhoto[],
      type: "replace" | "add"
   ): Promise<void>

   updateGroupVideos(groupId: string, videos: GroupVideo[]): Promise<void>

   followCompany(userData: UserData, group: Group): Promise<void>

   unfollowCompany(userId: string, groupId: string): Promise<void>

   updateGroupPublicProfileFlag(
      groupId: string,
      isPublic: boolean
   ): Promise<void>

   updateGroupBannerPhoto(
      groupId: string,
      bannerImageUrl: string
   ): Promise<void>

   /**
    * Adds a creator to a group.
    *
    * @param  groupId - The ID of the group.
    * @param  creatorData - The creator to be added.
    * @returns  A Promise that resolves when the creator is successfully added to the group.
    */
   addCreatorToGroup(groupId: string, creator: AddCreatorData): Promise<Creator>

   /**
    * Removes a creator from a group.
    *
    * @param  groupId - The ID of the group.
    * @param  creatorId - The ID of the creator to be removed.
    * @returns  A Promise that resolves when the creator is successfully removed from the group.
    */
   removeCreatorFromGroup(groupId: string, creatorId: string): Promise<void>

   /**
    * Updates a creator in a group.
    *
    * @param  groupId - The ID of the group.
    * @param  creatorId - The ID of the creator.
    * @param  creatorData - The updated data for the creator.
    * @returns A Promise that resolves with the updated creator.
    */
   updateCreatorInGroup(
      groupId: string,
      creatorId: string,
      creator: UpdateCreatorData
   ): Promise<Creator>

   /**
    * Updates a creator in a group.
    *
    * @param  groupId - The ID of the group.
    * @param  creatorId - The ID of the creator.
    * @param  returns A Promise that resolves with the updated creator.
    */
   updateCreatorRolesInGroup(
      groupId: string,
      creatorId: string,
      roles: CreatorRole[]
   ): Promise<void>

   /**
    * Checks if a creator's email is unique in a group
    * @param groupId the group to check
    * @param email the email to check
    * @returns true if the email is unique, false otherwise
    */
   creatorEmailIsUnique(groupId: string, email: string): Promise<boolean>

   /**
    * Gets a creator by their ID
    * @param groupId the group to get creators from
    * @param creatorId the creator to get
    * @returns A Promise that resolves with the creator.
    */
   getCreatorByGroupAndId(groupId: string, creatorId: string): Promise<Creator>

   /**
    * Gets a creator by their ID
    * @param creatorId the creator to get
    * @returns A Promise that resolves with the creator.
    */
   getCreatorById(creatorId: string): Promise<Creator>

   /**
    * Gets all group creators
    * @param groupId the group to get creators from
    * @returns A Promise that resolves with an array of creators.
    */
   getCreators(groupId: string): Promise<Creator[]>

   /**
    * Gets all group creators that have at least two public content (live streams or sparks)
    * Example: 1 live stream and 1 spark; 2 live streams and 0 sparks; 0 live streams and 2 sparks
    * @param groupId the group to get creators from
    * @returns A Promise that resolves with an array of creators.
    */
   getMentorsForLevels(group: PublicGroup): Promise<CreatorWithContent[]>

   /**
    * Gets all group creators with public content
    * @param groupId the group to get creators from
    * @returns A Promise that resolves with an array of creators.
    */
   getCreatorsWithPublicContent(group: Group | PublicGroup): Promise<Creator[]>

   /**
    * Gets all public content from a given creator
    * @param creator the creator to get the content from
    * @returns A Promise that resolves with an object containing the live streams and sparks
    * associated, as well as if the group the creator belongs to has any jobs.
    */
   getCreatorPublicContent(creator: Creator): Promise<CreatorPublicContent>

   /**
    * Updates the publicSparks flag in a group.
    *
    * @param  groupId - The ID of the group.
    * @param  isPublic - The value for the publicSparks flag.
    * @returns A Promise that resolves when the publicSparks flag is updated.
    */
   updatePublicSparks(groupId: string, isPublic: boolean): Promise<void>

   /**
    * Updates the group's logo image.
    *
    * @param  groupId - The ID of the group.
    * @param  image - The image metadata to store in the database.
    * @returns A Promise that resolves when the banner image URL is updated.
    */
   updateGroupLogo(groupId: string, image: ImageType): Promise<void>

   /**
    * Updates the group's banner image.
    *
    * @param  groupId - The ID of the group.
    * @param  image - The image metadata to store in the database.
    * @returns A Promise that resolves when the banner image URL is updated.
    */
   updateGroupBanner(groupId: string, image: ImageType): Promise<void>

   /**
    * Gets the users that are following a group.
    * @param groupId the group to get the following users from
    * @returns A Promise that resolves with an array of user ids.
    */
   getFollowingUsers(groupId: string): Promise<string[]>
}

export class FirebaseGroupRepository
   extends BaseFirebaseRepository
   implements IGroupRepository
{
   protected readonly COLLECTION_NAME: string = "careerCenterData"

   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      const userRef = this.firestore.collection("userData").doc(userEmail)

      return userRef.update({
         interestsIds: Array.from(new Set(interestIds)),
      })
   }

   async getGroupsByIds(groupIds: string[]): Promise<Group[]> {
      const uniqueGroupIds = Array.from(new Set(groupIds))
      const groupRefs = uniqueGroupIds.map((groupId) =>
         this.firestore.collection("careerCenterData").doc(groupId)
      )
      const groupSnapshots = await Promise.all(
         groupRefs.map((ref) => ref.get())
      )
      return groupSnapshots
         .filter((snap) => snap.exists)
         .map((snapshot) => ({
            ...snapshot.data(),
            id: snapshot.id,
         }))
         .filter(activeGroupFilter) as Group[]
   }

   cleanAndSerializeGroup(
      group: Group
   ): Omit<Group, "adminEmails" | "adminEmail"> {
      const serializedGroup = { ...group }
      delete serializedGroup.adminEmails
      delete serializedGroup.adminEmail
      return serializedGroup
   }

   async getGroupById(groupId: string): Promise<Group> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
      const groupSnapshot = await groupRef.get()
      if (!groupSnapshot.exists) {
         return null
      }
      return this.addIdToDoc<Group>(groupSnapshot)
   }

   async getAdminGroups(
      userEmail: string,
      isAdmin: boolean
   ): Promise<Group[] | UserAdminGroup[]> {
      if (isAdmin) {
         // If user is admin, return all groups
         const snaps = await this.firestore.collection("careerCenterData").get()
         return mapFirestoreDocuments<Group>(snaps)?.filter(activeGroupFilter)
      }
      const snaps = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userAdminGroups")
         .get()
      return mapFirestoreDocuments<UserAdminGroup>(snaps)
   }

   /*
   |--------------------------------------------------------------------------
   | ATS Actions
   |--------------------------------------------------------------------------
   */
   async getATSIntegrations(
      groupId: string
   ): Promise<GroupATSAccountDocument[]> {
      const docs = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .get()

      if (docs.empty) {
         return []
      }

      return this.addIdToDocs<GroupATSAccountDocument>(docs.docs)
   }

   createATSIntegration(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSAccountDocument>
   ) {
      data.updatedAt =
         this.fieldValue.serverTimestamp() as firebase.firestore.Timestamp
      data.createdAt =
         this.fieldValue.serverTimestamp() as firebase.firestore.Timestamp

      return this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)
         .set(data)
   }

   saveATSIntegrationTokens(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSIntegrationTokensDocument>
   ) {
      return this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)
         .collection("tokens")
         .doc("tokens")
         .set(data)
   }

   async getATSIntegrationTokens(groupId: string, integrationId: string) {
      const doc = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)
         .collection("tokens")
         .doc("tokens")
         .get()

      if (!doc.exists) {
         return null
      }

      return this.addIdToDoc<GroupATSIntegrationTokensDocument>(doc)
   }

   /**
    * Removes the ATS document and child documents
    *
    * @param groupId
    * @param integrationId
    */
   async removeATSIntegration(
      groupId: string,
      integrationId: string
   ): Promise<void> {
      const batch = this.firestore.batch()

      batch.delete(
         this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("ats")
            .doc(integrationId)
      )

      // Child documents
      batch.delete(
         this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("ats")
            .doc(integrationId)
            .collection("tokens")
            .doc("tokens")
      )

      return await batch.commit()
   }

   async getGroupQuestions(groupId: string): Promise<GroupQuestion[]> {
      const groupQuestionRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
      const snapshots = await groupQuestionRef.get()
      return mapFirestoreDocuments<GroupQuestion>(snapshots)
   }

   getGroupCustomQuestionsQuery(
      groupId: string
   ): firebase.firestore.Query<firebase.firestore.DocumentData> {
      return this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
         .where("questionType", "==", "custom")
   }

   groupAvailableCustomJobsQuery(
      groupId: string
   ): firebase.firestore.Query<firebase.firestore.DocumentData> {
      return this.firestore
         .collection("customJobs")
         .where("groupId", "==", groupId)
         .where("deadline", ">", new Date())
         .where("published", "==", true)
         .orderBy("deadline", "desc")
   }

   listenToGroupQuestions(
      groupId: string,
      callback: OnSnapshotCallback<GroupQuestion>
   ): Unsubscribe {
      const groupQuestionsRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
      return groupQuestionsRef.onSnapshot(callback)
   }

   async addNewGroupQuestion(
      groupId: string,
      groupQuestion: Create<GroupQuestion>
   ): Promise<GroupQuestion> {
      const newQuestionRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
         .withConverter(createCompatGenericConverter<GroupQuestion>())
         .doc()

      const newQuestion: GroupQuestion = {
         ...groupQuestion,
         id: newQuestionRef.id,
      }

      await newQuestionRef.set(newQuestion)

      return newQuestion
   }

   async updateGroupQuestion(
      groupId: string,
      groupQuestion: GroupQuestion
   ): Promise<void> {
      const groupQuestionsRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
      await groupQuestionsRef.doc(groupQuestion.id).update(groupQuestion)
   }

   async deleteGroupQuestion(
      groupId: string,
      groupQuestionId: string
   ): Promise<void> {
      const groupQuestionsRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
      await groupQuestionsRef.doc(groupQuestionId).delete()
   }

   async getFieldOrLevelOfStudyGroupQuestion(
      groupId: string,
      questionType: Exclude<GroupQuestion["questionType"], "custom">
   ): Promise<GroupQuestion> {
      const groupFieldsOfStudySnaps = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
         .where("questionType", "==", questionType)
         .limit(1)
         .get()
      return mapFirestoreDocuments<GroupQuestion>(groupFieldsOfStudySnaps)?.[0]
   }

   async getAllPublicProfileGroups(): Promise<Group[]> {
      const groupSnapshots = await this.firestore
         .collection("careerCenterData")
         .where("publicProfile", "==", true)
         .get()
      return mapFirestoreDocuments<Group>(groupSnapshots)
   }

   /*
    * Takes the groups questions from an event and then fetches and maps the user's
    * answers to each of the questions
    * */
   async mapUserAnswersToLivestreamGroupQuestions(
      userData: UserData,
      livestream: LivestreamEvent
   ): Promise<LivestreamGroupQuestionsMap> {
      const livestreamGroupQuestionsMap: LivestreamGroupQuestionsMap =
         cloneDeep(livestream.groupQuestionsMap) || {}

      if (!Object.keys(livestreamGroupQuestionsMap).length) {
         return livestreamGroupQuestionsMap
      }

      const arrayOfGroups = Object.values(livestreamGroupQuestionsMap || {})

      for (const groupDataWithQuestions of arrayOfGroups) {
         const userGroupQuestionAnswers = await this.getUserGroupDataByGroupId(
            userData.userEmail,
            groupDataWithQuestions.groupId
         )
         Object.values(groupDataWithQuestions.questions).forEach(
            (groupQuestion) => {
               const userSelectedAnswerId =
                  userGroupQuestionAnswers?.questions?.[groupQuestion.id]
               const validAnswerId =
                  groupQuestion?.options?.[userSelectedAnswerId]
               const question =
                  livestreamGroupQuestionsMap[groupDataWithQuestions.groupId]
                     ?.questions?.[groupQuestion.id]

               if (validAnswerId) {
                  question.selectedOptionId = userSelectedAnswerId
               } else {
                  question.selectedOptionId = null
                  question.isNew = true
               }
            }
         )
      }

      return livestreamGroupQuestionsMap
   }

   /*
    * User group data methods
    * */

   async getAllUserGroupData(userEmail: string): Promise<UserGroupData[]> {
      const userGroupDataRef = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userGroups")
         .get()
      return mapFirestoreDocuments<UserGroupData>(userGroupDataRef)
   }

   async deleteUserGroupData(
      userEmail: string,
      groupId: string
   ): Promise<void> {
      return await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userGroups")
         .doc(groupId)
         .delete()
   }

   async getUserGroupDataByGroupId(
      userEmail: string,
      groupId
   ): Promise<UserGroupData> {
      const userGroupSnap = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userGroups")
         .doc(groupId)
         .get()
      return userGroupSnap.exists
         ? ({ id: userGroupSnap.id, ...userGroupSnap.data() } as UserGroupData)
         : null
   }

   async getAllUserGroupDataIds(userEmail: string): Promise<string[]> {
      const userGroupDataSnap = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userGroups")
         .get()
      return userGroupDataSnap.docs.map((doc) => doc.id)
   }

   async getGroupDashboardInviteById(
      inviteId: string
   ): Promise<GroupDashboardInvite> {
      if (!inviteId) {
         return null
      }
      const doc = await this.firestore
         .collection("groupDashboardInvites")
         .doc(inviteId)
         .get()
      if (doc.exists) {
         return doc.data() as GroupDashboardInvite
      }
      return null
   }

   async setGroupAdminRoleInFirestore(
      group: Group,
      userData: Pick<UserData, "id" | "userEmail" | "firstName" | "lastName">,
      role?: GROUP_DASHBOARD_ROLE
   ): Promise<void> {
      const batch = this.firestore.batch()
      const groupAdminsRef = this.firestore
         .collection("careerCenterData")
         .doc(group.id)
         .collection("groupAdmins")
         .doc(userData.id)

      const userAdminGroupsRef = this.firestore
         .collection("userData")
         .doc(userData.id)
         .collection("userAdminGroups")
         .doc(group.id)

      const userRef = this.firestore.collection("userData").doc(userData.id)

      if (role) {
         // if a role is provided, then we are adding the user as an admin
         const groupAdminDataToSave: GroupAdmin = {
            role,
            email: userData.userEmail,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            displayName: [userData.firstName, userData.lastName]
               .filter((name) => name)
               .join(" "),
            id: userData.id,
            groupId: group.id,
         }

         // save the group admin data to the group's admins sub-collection
         batch.set(groupAdminsRef, groupAdminDataToSave, { merge: true })

         const userAdminGroupsDataToSave: UserAdminGroup = {
            id: group.id,
            userId: userData.id,
            universityName: group.universityName,
            description: group.description || "",
            logoUrl: group.logoUrl || "",
            extraInfo: group.extraInfo || "",
            universityCode: group.universityCode || "",
         }

         // Store the group data in the user's admin groups sub-collection for easy querying
         batch.set(userAdminGroupsRef, userAdminGroupsDataToSave, {
            merge: true,
         })
      } else {
         // If no role is provided, then we are removing the user as an admin
         batch.delete(groupAdminsRef)
         batch.delete(userAdminGroupsRef)
      }

      batch.update(userRef, {
         refreshTokenTime: this.fieldValue.serverTimestamp(), // update the user's refresh token time to force a refresh of the user's custom claims in the auth provider
      })

      return batch.commit()
   }

   /*
    * Checks if there will be at least one owner after the role change
    * */
   protected async checkIfThereWillBeAtLeastOneOwner(
      groupId: string,
      newRole: GROUP_DASHBOARD_ROLE,
      userEmail: string
   ) {
      const currentAdmins = (await this.getGroupAdmins(groupId)) || []

      const potentialNewAdmins: Partial<GroupAdmin>[] = [
         ...currentAdmins.filter((admin) => admin.id !== userEmail),
         // add the new admin to the list of current admins if it's not already there
         ...(newRole ? [{ id: userEmail, role: newRole }] : []), // if the new role is null, then the user is being removed as an admin
      ]

      const totalOwners = potentialNewAdmins.filter(
         (admin) => admin.role === GROUP_DASHBOARD_ROLE.OWNER
      )

      return totalOwners.length > 0 // there must be at least one owner
   }

   async getGroupAdmins(groupId: string): Promise<GroupAdmin[]> {
      const adminsSnap = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupAdmins")
         .get()

      return mapFirestoreDocuments(adminsSnap)
   }

   async getGroupAvailableCustomJobs(groupId: string): Promise<CustomJob[]> {
      const snaps = await this.groupAvailableCustomJobsQuery(groupId).get()

      return mapFirestoreDocuments<CustomJob>(snaps)
   }

   async getGroupByGroupName(groupName: string): Promise<Group> {
      const adminsSnap = await this.firestore
         .collection("careerCenterData")
         .where("universityName", "==", groupName)
         .limit(1)
         .get()

      return mapFirestoreDocuments<Group>(adminsSnap)?.[0]
   }

   updateGroupMetadata(
      groupId: string,
      metadata: Pick<
         Group,
         | "extraInfo"
         | "companySize"
         | "companyIndustries"
         | "companyCountry"
         | "targetedCountries"
         | "targetedUniversities"
         | "targetedFieldsOfStudy"
         | "privacyPolicyActive"
         | "privacyPolicyUrl"
         | "universityName"
         | "normalizedUniversityName"
         | "careerPageUrl"
      >
   ): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      return groupRef.update(metadata)
   }

   updateGroupTestimonials(
      groupId: string,
      testimonials: Testimonial[]
   ): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      return groupRef.set({ testimonials }, { merge: true })
   }

   updateGroupPhotos(
      groupId: string,
      photos: GroupPhoto[],
      type: "replace" | "add"
   ): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      if (photos.length > MAX_GROUP_PHOTOS_COUNT) {
         throw new Error(`You can only have ${MAX_GROUP_PHOTOS_COUNT} photos`)
      }

      if (type === "add") {
         // We must check if the new added photos will exceed the max count
         return this.firestore.runTransaction(async (transaction) => {
            const groupSnap = await transaction.get(groupRef)
            const group = groupSnap.data() as Group
            const newPhotos = [...(group.photos || []), ...photos]
            if (newPhotos.length < MAX_GROUP_PHOTOS_COUNT) {
               transaction.update(groupSnap.ref, { photos: newPhotos })
            } else {
               throw new Error(
                  `You can only have ${MAX_GROUP_PHOTOS_COUNT} photos`
               )
            }
         })
      } else {
         return groupRef.update({ photos })
      }
   }

   updateGroupVideos(groupId: string, videos: GroupVideo[]): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const toUpdate: Pick<Group, "videos"> = {
         videos: videos,
      }

      return groupRef.update(toUpdate)
   }
   followCompany(userData: UserData, group: Group): Promise<void> {
      const followRef = this.firestore
         .collection("userData")
         .doc(userData.id)
         .collection("companiesUserFollows")
         .doc(group.id)

      const followData: CompanyFollowed = {
         groupId: group.id,
         group: pickPublicDataFromGroup(group),
         id: group.id,
         createdAt:
            this.fieldValue.serverTimestamp() as firebase.firestore.Timestamp,
         user: pickPublicDataFromUser(userData),
         userId: userData.id,
      }

      return followRef.set(followData, { merge: true })
   }

   unfollowCompany(userId: string, groupId: string): Promise<void> {
      const followRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("companiesUserFollows")
         .doc(groupId)

      return followRef.delete()
   }

   updateGroupPublicProfileFlag(
      groupId: string,
      isPublic: boolean
   ): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const toUpdate: Pick<Group, "publicProfile"> = {
         publicProfile: isPublic,
      }

      return groupRef.update(toUpdate)
   }

   updateGroupBannerPhoto(
      groupId: string,
      bannerImageUrl: string
   ): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const toUpdate: Pick<Group, "bannerImageUrl"> = {
         bannerImageUrl,
      }

      return groupRef.update(toUpdate)
   }

   /*
   |--------------------------------------------------------------------------
   | Mappings and Filters
   |--------------------------------------------------------------------------
   */

   async addCreatorToGroup(
      groupId: string,
      creator: AddCreatorData
   ): Promise<Creator> {
      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .doc()

      const creatorData: Creator = {
         ...creator,
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         createdAt: this.fieldValue.serverTimestamp() as any,
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         updatedAt: this.fieldValue.serverTimestamp() as any,
         id: creatorRef.id, // We use the firestore auto generated id
         documentType: "groupCreator",
         groupId,
         roles: creator.roles,
      }

      creatorRef.set(creatorData, { merge: true }).then(() => {
         return creatorData.id
      })

      return creatorData
   }

   async updateCreatorInGroup(
      groupId: string,
      creatorId: string,
      creator: UpdateCreatorData
   ): Promise<Creator> {
      const updateCreatorData: UpdateCreatorData & Pick<Creator, "updatedAt"> =
         {
            ...creator,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updatedAt: this.fieldValue.serverTimestamp() as any,
         }

      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .doc(creatorId) // We use the email as the id and not firestore's auto generated id

      await creatorRef.update(updateCreatorData)

      const creatorSnap = await creatorRef.get()

      return this.addIdToDoc<Creator>(creatorSnap)
   }

   async updateCreatorRolesInGroup(
      groupId: string,
      creatorId: string,
      roles: CreatorRole[]
   ): Promise<void> {
      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .doc(creatorId)

      await creatorRef.update({
         roles: this.fieldValue.arrayUnion(...roles),
         updatedAt: this.fieldValue.serverTimestamp(),
      })
   }

   removeCreatorFromGroup(groupId: string, creatorId: string): Promise<void> {
      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .doc(creatorId)

      return creatorRef.delete()
   }

   creatorEmailIsUnique(groupId: string, email: string): Promise<boolean> {
      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .where("email", "==", email)
         .limit(1)

      return creatorRef.get().then((snap) => snap.empty)
   }

   async getCreatorByGroupAndId(
      groupId: string,
      creatorId: string
   ): Promise<Creator> {
      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .doc(creatorId)

      const snapshot = await creatorRef.get()

      if (snapshot.exists) {
         return this.addIdToDoc<Creator>(snapshot)
      }
      return null
   }

   async getCreatorById(creatorId: string): Promise<Creator | null> {
      const creatorRef = this.firestore
         .collectionGroup("creators")
         .where("id", "==", creatorId)
         .limit(1)
         .withConverter(createCompatGenericConverter<Creator>())

      const snapshot = await creatorRef.get()

      if (snapshot.empty) {
         return null
      }

      return snapshot.docs[0].data()
   }

   async getCreators(groupId: string): Promise<Creator[]> {
      const snaps = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .get()

      return mapFirestoreDocuments<Creator>(snaps)
   }

   async getMentorsForLevels(
      group: Group | PublicGroup
   ): Promise<CreatorWithContent[]> {
      if (!group?.id) return []

      const getCreatorSlug = (creator: Creator | PublicCreator | Speaker) => {
         return transformCreatorNameIntoSlug(
            creator.firstName,
            creator.lastName
         )
      }

      const [creatorsSnaps, livestreamsSnaps] = await Promise.all([
         this.firestore
            .collection("careerCenterData")
            .doc(group.id)
            .collection("creators")
            .get(),
         this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", group.id)
            .where("test", "==", false)
            .where("hidden", "==", false)
            .where("denyRecordingAccess", "==", false)
            .get(),
      ])

      if (creatorsSnaps.empty) return []

      const creators = mapFirestoreDocuments<Creator>(creatorsSnaps)

      const creatorsMapById: Record<string, Creator> = {}
      for (const creator of creators) {
         if (creator.id) {
            creatorsMapById[creator.id] = creator
         }
      }

      const creatorsIdBySlug: Record<string, string> = {}
      for (const creator of creators) {
         if (creator.firstName && creator.lastName && creator.id) {
            creatorsIdBySlug[getCreatorSlug(creator)] = creator.id
         }
      }

      const creatorContentCount: Record<string, number> = {}

      const creatorsWithSparksSnaps = group.publicSparks
         ? await Promise.all(
              creators.map((creator) => {
                 return this.firestore
                    .collection("sparks")
                    .where("published", "==", true)
                    .where("creator.id", "==", creator.id)
                    .get()
              })
           )
         : []

      for (const snap of creatorsWithSparksSnaps) {
         if (snap.empty) continue

         const sparks = mapFirestoreDocuments<Spark>(snap)
         if (!sparks) continue

         for (const spark of sparks) {
            const creatorId = creatorsIdBySlug[getCreatorSlug(spark.creator)]
            if (!creatorId) continue

            creatorContentCount[creatorId] =
               (creatorContentCount[creatorId] || 0) + 1
         }
      }

      const livestreams =
         mapFirestoreDocuments<LivestreamEvent>(livestreamsSnaps)

      // covers co-hosted live stream edge case
      const groupLivestreams = livestreams.filter(
         (livestream) => livestream.groupIds[0] === group.id
      )

      for (const livestream of groupLivestreams) {
         if (livestream.speakers) {
            for (const speaker of livestream.speakers) {
               const creatorId = creatorsIdBySlug[getCreatorSlug(speaker)]
               if (!creatorId) continue

               creatorContentCount[creatorId] =
                  (creatorContentCount[creatorId] || 0) + 1
            }
         }
      }

      const creatorsWithTwoOrMoreContent = uniqBy(
         creators,
         (creator) => creator.id
      )
         .filter((creator) => {
            const creatorId = creatorsIdBySlug[getCreatorSlug(creator)]
            return creatorId && creatorContentCount[creatorId] >= 2
         })
         .map((creator) => ({
            ...creator,
            numberOfContent:
               creatorContentCount[creatorsIdBySlug[getCreatorSlug(creator)]] ||
               0,
            companyName: group.universityName,
            companyLogoUrl: group.logoUrl,
            companyBannerUrl: group.bannerImageUrl,
         }))

      return creatorsWithTwoOrMoreContent
   }

   async getCreatorsWithPublicContent(
      group: Group | PublicGroup
   ): Promise<Creator[]> {
      if (!group?.id) return []

      const [creatorsSnaps, livestreamsSnaps] = await Promise.all([
         this.firestore
            .collection("careerCenterData")
            .doc(group.id)
            .collection("creators")
            .get(),
         this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", group.id)
            .where("test", "==", false)
            .where("hidden", "==", false)
            .where("denyRecordingAccess", "==", false)
            .get(),
      ])

      if (creatorsSnaps.empty) return []

      const creators = mapFirestoreDocuments<Creator>(creatorsSnaps)

      const creatorsMapById = new Map<string, Creator>()
      creators.forEach((creator) => {
         if (creator.id) {
            creatorsMapById.set(creator.id, creator)
         }
      })

      const creatorsMapByEmail = new Map<string, Creator>()
      creators.forEach((creator) => {
         if (creator.id) {
            creatorsMapByEmail.set(creator.email, creator)
         }
      })

      const creatorsWithSparksSnaps = group.publicSparks
         ? await Promise.all(
              creators.map((creator) => {
                 return this.firestore
                    .collection("sparks")
                    .where("published", "==", true)
                    .where("creator.id", "==", creator.id)
                    .limit(1)
                    .get()
              })
           )
         : []

      const creatorsWithSparks = creatorsWithSparksSnaps
         .filter((snap) => !snap.empty)
         .map((snap) => mapFirestoreDocuments<Spark>(snap)[0])
         .map((sparks) => creatorsMapById.get(sparks.creator.id))
         .filter(Boolean)

      if (livestreamsSnaps.empty) return creatorsWithSparks

      const livestreams =
         mapFirestoreDocuments<LivestreamEvent>(livestreamsSnaps)

      // covers co-hosted live stream edge case
      const groupLivestreams = livestreams.filter(
         (livestream) => livestream.groupIds[0] === group.id
      )
      const creatorsWithLivestreams = groupLivestreams
         .flatMap((livestream) => {
            return livestream.speakers
               ?.map((speaker) => creatorsMapByEmail.get(speaker.email))
               .filter(Boolean)
         })
         .filter(Boolean)

      if (creatorsWithLivestreams.length === 0) return creatorsWithSparks

      const creatorsWithPublicContent = [
         ...creatorsWithLivestreams,
         ...creatorsWithSparks,
      ]

      const resultWithNoDuplicates = uniqBy(
         creatorsWithPublicContent,
         (creator) => creator.id
      )

      return resultWithNoDuplicates
   }

   async getCreatorPublicContent(
      creator: Creator
   ): Promise<CreatorPublicContent> {
      if (!creator.groupId)
         return { sparks: [], livestreams: [], hasJobs: false }

      const group = await this.getGroupById(creator.groupId)

      const [groupLivestreamsSnaps, sparksSnaps, groupJobs] = await Promise.all(
         [
            this.firestore
               .collection("livestreams")
               .where("groupIds", "array-contains", group.id)
               .where("test", "==", false)
               .where("hidden", "==", false)
               .where("denyRecordingAccess", "==", false)
               .orderBy("start", "desc")
               .get(),
            group.publicSparks
               ? this.firestore
                    .collection("sparks")
                    .where("published", "==", true)
                    .where("creator.id", "==", creator.id)
                    .get()
               : null,
            this.firestore
               .collection("customJobs")
               .where("groupId", "==", group.id)
               .where("deleted", "==", false)
               .where("published", "==", true)
               .where("deadline", ">=", new Date())
               .limit(1)
               .get(),
         ]
      )

      const creatorsSparks =
         sparksSnaps && mapFirestoreDocuments<Spark>(sparksSnaps)

      const groupLivestreams = mapFirestoreDocuments<LivestreamEvent>(
         groupLivestreamsSnaps
      )

      const creatorLivestreams =
         groupLivestreams?.filter((livestream) =>
            // filter by email for backwards compatibility
            livestream.speakers.find(
               (speaker) => speaker.email == creator.email
            )
         ) ?? []

      const hasJobs = !groupJobs.empty

      return {
         sparks: creatorsSparks || [],
         livestreams: creatorLivestreams || [],
         hasJobs,
      }
   }

   async updatePublicSparks(groupId: string, isPublic: boolean): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const toUpdate: Pick<Group, "publicSparks"> = {
         publicSparks: isPublic,
      }
      return groupRef.update(toUpdate)
   }

   async getFollowingUsers(groupId: string): Promise<string[]> {
      const followingUsersSnaps = await this.firestore
         .collectionGroup("companiesUserFollows")
         .where("groupId", "==", groupId)
         .get()

      if (followingUsersSnaps.empty) {
         return []
      }

      return followingUsersSnaps.docs.map((doc) => doc.data().userId)
   }

   updateGroupLogo(groupId: string, image: ImageType): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const toUpdate: Pick<Group, "logo" | "logoUrl"> = {
         logo: image,
         logoUrl: image.url,
      }

      return groupRef.update(toUpdate)
   }

   updateGroupBanner(groupId: string, image: ImageType): Promise<void> {
      const groupRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)

      const toUpdate: Pick<Group, "banner" | "bannerImageUrl"> = {
         banner: image,
         bannerImageUrl: image.url,
      }

      return groupRef.update(toUpdate)
   }
}

/*
|--------------------------------------------------------------------------
| Mappings and Filters
|--------------------------------------------------------------------------
*/
export class GroupsDataParser {
   constructor(private groups: Group[]) {}

   filterByCompanyCountry(companyCountriesIds: string[]) {
      this.groups = this.groups?.filter(({ companyCountry }) =>
         companyCountriesIds.includes(companyCountry.id)
      )
      return this
   }

   filterByCompanyIndustry(companyIndustryIds: string[]) {
      this.groups = this.groups?.filter(({ companyIndustries }) =>
         containsAny(
            companyIndustries.map((industry) => industry.id),
            companyIndustryIds
         )
      )

      return this
   }

   filterByCompanySize(companySizes: string[]) {
      this.groups = this.groups?.filter(({ companySize }) =>
         companySizes.includes(companySize)
      )
      return this
   }

   get() {
      return this.groups
   }
}

export const activeGroupFilter = (group: Group) => group.inActive !== true
