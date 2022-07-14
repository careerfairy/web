import firebase from "firebase/app"
import { CustomCategory, Group } from "./groups"
import {
   mapFirestoreDocuments,
   OnSnapshotCallback,
   Unsubscribe,
} from "../../util/FirebaseUtils"

export interface IGroupRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>
   getGroupsByIds(groupIds: string[]): Promise<Group[]>
   getGroupById(groupId: string): Promise<Group>
   getAdminGroups(userEmail: string, isAdmin: boolean): Promise<Group[]>
   checkIfUserHasAdminGroups(userEmail: string): Promise<boolean>
   cleanAndSerializeGroup(
      group: Group
   ): Omit<Group, "adminEmails" | "adminEmail">
   getCustomCategories(groupId: string): Promise<CustomCategory[]>
   addNewCustomCategory(
      groupId: string,
      category: Omit<CustomCategory, "id">
   ): Promise<void>
   updateCustomCategory(
      groupId: string,
      category: CustomCategory
   ): Promise<void>
   createGroup(
      group: Partial<Group>,
      customCategories: CustomCategory[],
      userEmail: string
   ): Promise<firebase.firestore.DocumentReference>
   deleteCustomCategory(groupId: string, categoryId: string): Promise<void>
   listenToCustomCategories(
      groupId: string,
      callback: OnSnapshotCallback<CustomCategory>
   ): Unsubscribe
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

   async getCustomCategories(groupId: string): Promise<CustomCategory[]> {
      const groupCustomCategoriesRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customCategories")
      const snapshots = await groupCustomCategoriesRef.get()
      return mapFirestoreDocuments<CustomCategory>(snapshots)
   }

   listenToCustomCategories(
      groupId: string,
      callback: OnSnapshotCallback<CustomCategory>
   ): Unsubscribe {
      const groupCustomCategoriesRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customCategories")
      return groupCustomCategoriesRef.onSnapshot(callback)
   }

   async addNewCustomCategory(
      groupId: string,
      category: Omit<CustomCategory, "id">
   ): Promise<void> {
      const groupCustomCategoriesRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customCategories")
      await groupCustomCategoriesRef.add(category)
   }

   async updateCustomCategory(
      groupId: string,
      category: CustomCategory
   ): Promise<void> {
      const groupCustomCategoriesRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customCategories")
      await groupCustomCategoriesRef.doc(category.id).update(category)
   }

   async deleteCustomCategory(
      groupId: string,
      categoryId: string
   ): Promise<void> {
      const groupCustomCategoriesRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("customCategories")
      await groupCustomCategoriesRef.doc(categoryId).delete()
   }

   async createGroup(
      group: Partial<Group>,
      customCategories: CustomCategory[],
      userEmail: string
   ): Promise<firebase.firestore.DocumentReference> {
      const removeTempCategoryIds = (customCategories: CustomCategory[]) => {
         return customCategories.map((category) => {
            delete category.id
            return category
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

      // add the custom categories to the the the customCategories sub-collection
      removeTempCategoryIds(customCategories).forEach((category) => {
         const categoryRef = this.firestore
            .collection("careerCenterData")
            .doc(groupRef.id)
            .collection("customCategories")
            .doc()
         batch.set(categoryRef, category)
      })

      batch.set(groupRef, newGroup)
      // Set the creating user with the mainAdmin role
      batch.set(groupAdminRef, { role: "mainAdmin" })

      await batch.commit()

      return groupRef
   }
}
