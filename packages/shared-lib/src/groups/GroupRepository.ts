import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
   mapFirestoreDocuments,
   OnSnapshotCallback,
   Unsubscribe,
} from "../BaseFirebaseRepository"
import { LivestreamEvent, LivestreamGroupQuestionsMap } from "../livestreams"
import {
   CompanyFollowed,
   pickPublicDataFromUser,
   UserAdminGroup,
   UserData,
} from "../users"
import {
   AddCreatorData,
   Creator,
   CreatorRoles,
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
   Testimonial,
   UserGroupData,
} from "./groups"
import { Create, ImageType } from "../commonTypes"
import {
   CustomJob,
   pickPublicDataFromCustomJob,
   PublicCustomJob,
} from "./customJobs"
import { Timestamp } from "../firebaseTypes"

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

   getAllGroups(): Promise<Group[]>

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
    * @param  creatorData - The updated data for the creator.
    * @returns A Promise that resolves with the updated creator.
    */
   updateCreatorInGroup(
      groupId: string,
      creatorId: string,
      creator: UpdateCreatorData
   ): Promise<Creator>

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
   getCreatorById(groupId: string, creatorId: string): Promise<Creator>

   /**
    * Gets all group creators
    * @param groupId the group to get creators from
    * @returns A Promise that resolves with an array of creators.
    */
   getCreators(groupId: string): Promise<Creator[]>

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
    * To create a custom job as sub collection of the group document
    * @param job
    * @param groupId
    */
   createGroupCustomJob(job: PublicCustomJob, groupId: string): Promise<void>

   /**
    * To update a existing custom job on the sub collection of the group document
    * @param job
    * @param groupId
    */
   updateGroupCustomJob(job: PublicCustomJob, groupId: string): Promise<void>

   /**
    * To get a custom job by id on the sub collection of the group document
    * @param jobId
    * @param groupId
    */
   getCustomJobById(jobId: string, groupId: string): Promise<PublicCustomJob>

   /**
    * To update an existing job with a new applicant
    * And increments the 'clicks' field on a specific customJob and adds the
    * @param userId
    * @param groupId
    * @param jobId
    */
   applyUserToCustomJob(
      userId: string,
      groupId: string,
      jobId: string
   ): Promise<void>
}

export class FirebaseGroupRepository
   extends BaseFirebaseRepository
   implements IGroupRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      let userRef = this.firestore.collection("userData").doc(userEmail)

      return userRef.update({
         interestsIds: Array.from(new Set(interestIds)),
      })
   }

   async getGroupsByIds(groupIds: string[]): Promise<any> {
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
      data.updatedAt = this.fieldValue.serverTimestamp() as any
      data.createdAt = this.fieldValue.serverTimestamp() as any

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

   async getAllGroups(): Promise<Group[]> {
      const groupSnapshots = await this.firestore
         .collection("careerCenterData")
         .get()
      return mapFirestoreDocuments<Group>(groupSnapshots)
   }

   /*
    * Goes and fetches a user's university group level and field of study questions
    * and add them to the event group questions
    * */
   private async addUniversityLevelAndFieldOfStudyQuestionsToEventQuestions(
      userUniversityGroupId: string,
      eventGroupQuestions: LivestreamGroupQuestionsMap
   ): Promise<LivestreamGroupQuestionsMap> {
      let eventQuestions = { ...eventGroupQuestions }
      // fetch the group's field and level of study questions and add them
      const [fieldOfStudyQuestion, levelOfStudyQuestion] = await Promise.all([
         this.getFieldOrLevelOfStudyGroupQuestion(
            userUniversityGroupId,
            "fieldOfStudy"
         ),
         this.getFieldOrLevelOfStudyGroupQuestion(
            userUniversityGroupId,
            "levelOfStudy"
         ),
      ])

      if (fieldOfStudyQuestion) {
         eventQuestions = FirebaseGroupRepository.addQuestionToMap(
            eventGroupQuestions,
            userUniversityGroupId,
            fieldOfStudyQuestion
         )
      }
      if (levelOfStudyQuestion) {
         eventQuestions = FirebaseGroupRepository.addQuestionToMap(
            eventGroupQuestions,
            userUniversityGroupId,
            levelOfStudyQuestion
         )
      }

      return eventQuestions
   }

   private static addQuestionToMap(
      groupQuestionsMap: LivestreamGroupQuestionsMap,
      groupId: string,
      question: GroupQuestion
   ): LivestreamGroupQuestionsMap {
      return {
         ...groupQuestionsMap,
         [groupId]: {
            groupId: groupId,
            ...groupQuestionsMap[groupId],
            questions: {
               ...groupQuestionsMap[groupId]?.questions,
               [question.id]: question,
            },
         },
      }
   }

   /*
    * Takes the groups questions from an event and then fetches and maps the user's
    * answers to each of the questions
    * */
   async mapUserAnswersToLivestreamGroupQuestions(
      userData: UserData,
      livestream: LivestreamEvent
   ): Promise<LivestreamGroupQuestionsMap> {
      let livestreamGroupQuestionsMap: LivestreamGroupQuestionsMap =
         cloneDeep(livestream.groupQuestionsMap) || {}

      const userUniversityCode = userData.university?.code
      const usersUniversityGroup = Object.values(
         livestreamGroupQuestionsMap
      )?.find(
         (data) =>
            data.universityCode && data.universityCode === userUniversityCode
      )
      if (usersUniversityGroup) {
         livestreamGroupQuestionsMap =
            await this.addUniversityLevelAndFieldOfStudyQuestionsToEventQuestions(
               usersUniversityGroup.groupId,
               livestreamGroupQuestionsMap
            )
      }

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
         createdAt: this.fieldValue.serverTimestamp() as any,
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
      const creatorData: Creator = {
         ...creator,
         createdAt: this.fieldValue.serverTimestamp() as any,
         updatedAt: this.fieldValue.serverTimestamp() as any,
         id: creator.email, // We use the email as the id and not firestore's auto generated id
         documentType: "groupCreator",
         groupId,
         roles: [CreatorRoles.Spark], // By default, all creators are sparks for now
      }

      const creatorRef = this.firestore
         .collection("careerCenterData")
         .doc(creatorData.groupId)
         .collection("creators")
         .doc(creatorData.id)

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

   async getCreatorById(groupId: string, creatorId: string): Promise<Creator> {
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

   async getCreators(groupId: string): Promise<Creator[]> {
      const snaps = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("creators")
         .get()

      return mapFirestoreDocuments<Creator>(snaps)
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

   async createGroupCustomJob(
      job: PublicCustomJob,
      groupId: string
   ): Promise<void> {
      const ref = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customJobs")
         .doc()

      const newJob: CustomJob = {
         documentType: "groupCustomJob",
         ...job,
         createdAt: this.fieldValue.serverTimestamp() as Timestamp,
         updatedAt: this.fieldValue.serverTimestamp() as Timestamp,
         livestreams: [],
         applicants: [],
         clicks: 0,
         id: ref.id,
      }

      await ref.set(newJob, { merge: true })
   }

   async updateGroupCustomJob(
      job: PublicCustomJob,
      groupId: string
   ): Promise<void> {
      const ref = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customJobs")
         .doc(job.id)

      const updatedJob: Partial<CustomJob> = {
         ...job,
         updatedAt: this.fieldValue.serverTimestamp() as Timestamp,
      }

      await ref.update(updatedJob)
   }

   async getCustomJobById(
      jobId: string,
      groupId: string
   ): Promise<PublicCustomJob> {
      const ref = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customJobs")
         .doc(jobId)

      const snapshot = await ref.get()

      if (snapshot.exists) {
         return pickPublicDataFromCustomJob(
            this.addIdToDoc<CustomJob>(snapshot)
         )
      }
      return null
   }

   async applyUserToCustomJob(
      userId: string,
      groupId: string,
      jobId: string
   ): Promise<void> {
      const ref = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customJobs")
         .doc(jobId)

      return ref.update({
         applicants: this.fieldValue.arrayUnion(userId),
         clicks: this.fieldValue.increment(1),
      })
   }
}

export const activeGroupFilter = (group: Group) => group.inActive !== true
