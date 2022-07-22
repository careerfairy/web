import firebase from "firebase/app"
import { GroupQuestion, Group } from "./groups"
import {
   mapFirestoreDocuments,
   OnSnapshotCallback,
   Unsubscribe,
} from "../BaseFirebaseRepository"

export interface IGroupRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>
   getGroupsByIds(groupIds: string[]): Promise<Group[]>
   getGroupById(groupId: string): Promise<Group>
   getAdminGroups(userEmail: string, isAdmin: boolean): Promise<Group[]>
   checkIfUserHasAdminGroups(userEmail: string): Promise<boolean>
   cleanAndSerializeGroup(
      group: Group
   ): Omit<Group, "adminEmails" | "adminEmail">
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
}

export class FirebaseGroupRepository implements IGroupRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

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
      return mapFirestoreDocuments<GroupQuestion>(groupFieldsOfStudySnaps)[0]
   }

   async getAllGroups(): Promise<Group[]> {
      const groupSnapshots = await this.firestore
         .collection("careerCenterData")
         .get()
      return mapFirestoreDocuments<Group>(groupSnapshots)
   }
}
