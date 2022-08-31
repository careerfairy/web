import {
   Group,
   GroupATSAccountDocument,
   GroupATSIntegrationTokensDocument,
   GroupQuestion,
   UserGroupData,
} from "./groups"
import BaseFirebaseRepository from "../BaseFirebaseRepository"
import firebase from "firebase/compat/app"
import {
   mapFirestoreDocuments,
   OnSnapshotCallback,
   Unsubscribe,
} from "../BaseFirebaseRepository"
import { UserData } from "../users"
import { LivestreamEvent, LivestreamGroupQuestionsMap } from "../livestreams"

const cloneDeep = require("lodash.clonedeep")

export interface IGroupRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>

   getGroupsByIds(groupIds: string[]): Promise<Group[]>

   getGroupById(groupId: string): Promise<Group>

   getAdminGroups(userEmail: string, isAdmin: boolean): Promise<Group[]>

   checkIfUserHasAdminGroups(userEmail: string): Promise<boolean>

   cleanAndSerializeGroup(
      group: Group
   ): Omit<Group, "adminEmails" | "adminEmail">

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
   ): Promise<{ isAdmin: boolean; group: Group }>

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
      groupQuestion: Omit<GroupQuestion, "id">
   ): Promise<void>

   updateGroupQuestion(
      groupId: string,
      groupQuestion: GroupQuestion
   ): Promise<void>

   createGroup(
      group: Partial<Group>,
      groupQuestions: GroupQuestion[],
      userEmail: string
   ): Promise<firebase.firestore.DocumentReference>

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
}

export class FirebaseGroupRepository
   extends BaseFirebaseRepository
   implements IGroupRepository
{
   constructor(
      private readonly firestore: firebase.firestore.Firestore,
      private readonly fieldValue: typeof firebase.firestore.FieldValue
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
         })) as Group[]
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
      return {
         ...groupSnapshot.data(),
         id: groupSnapshot.id,
      } as Group
   }

   async getAdminGroups(userEmail: string, isAdmin: boolean): Promise<Group[]> {
      let query: firebase.firestore.Query<firebase.firestore.DocumentData> =
         this.firestore.collection("careerCenterData")
      if (!isAdmin) {
         query = query.where("adminEmails", "array-contains", userEmail)
      }
      const groupSnapshots = await query.get()
      return groupSnapshots.docs.map((doc) => ({
         ...doc.data(),
         id: doc.id,
      })) as Group[]
   }

   async checkIfUserHasAdminGroups(userEmail: string): Promise<boolean> {
      const adminGroups = await this.firestore
         .collection("careerCenterData")
         .where("adminEmails", "array-contains", userEmail)
         .limit(1)
         .get()
      return adminGroups.docs.length > 0
   }

   async checkIfUserIsGroupAdmin(
      groupId: string,
      userEmail: string
   ): Promise<{ isAdmin: boolean; group: Group }> {
      const groupDoc = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .get()

      if (!groupDoc.exists) {
         return { isAdmin: false, group: null }
      }

      const group = this.addIdToDoc<Group>(groupDoc)

      return {
         isAdmin: group.adminEmails.includes(userEmail),
         group,
      }
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
      groupQuestion: Omit<GroupQuestion, "id">
   ): Promise<void> {
      const groupQuestionsRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
      await groupQuestionsRef.add(groupQuestion)
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

   async createGroup(
      group: Partial<Group>,
      groupQuestions: GroupQuestion[],
      userEmail: string
   ): Promise<firebase.firestore.DocumentReference> {
      const removeTempGroupQuestionIds = (groupQuestions: GroupQuestion[]) => {
         return groupQuestions.map((groupQuestion) => {
            delete groupQuestion.id
            return groupQuestion
         })
      }
      const newGroup = { ...group }
      const batch = this.firestore.batch()

      // Create group ref
      const groupRef = this.firestore.collection("careerCenterData").doc()
      // Create user's reference in th group admins sub-collection
      const groupAdminRef = this.firestore
         .collection("careerCenterData")
         .doc(groupRef.id)
         .collection("admins")
         .doc(userEmail)

      // Add the groupId property to the group object for legacy purposes
      // TODO: Remove this property in the future
      newGroup.groupId = groupRef.id

      // add the group questions to the the the groupQuestions sub-collection
      removeTempGroupQuestionIds(groupQuestions).forEach((groupQuestion) => {
         const groupQuestionRef = this.firestore
            .collection("careerCenterData")
            .doc(groupRef.id)
            .collection("groupQuestions")
            .doc()
         batch.set(groupQuestionRef, groupQuestion)
      })

      batch.set(groupRef, newGroup)
      // Set the creating user with the mainAdmin role
      batch.set(groupAdminRef, { role: "mainAdmin" })

      await batch.commit()

      return groupRef
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
      let livestreamGroupQuestionsMap: LivestreamGroupQuestionsMap = cloneDeep(
         livestream.groupQuestionsMap
      )
      if (!livestreamGroupQuestionsMap) {
         return null
      }

      const userUniversityCode = userData.university?.code
      const usersUniversityGroup = Object.values(
         livestream.groupQuestionsMap || {}
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
}
