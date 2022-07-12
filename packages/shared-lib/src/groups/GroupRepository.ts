import { Group, GroupATSAccount, GroupATSIntegrationTokens } from "./groups"
import BaseFirebaseRepository from "../BaseFirebaseRepository"
import firebase from "firebase/compat/app"

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
   getATSIntegrations(groupId: string): Promise<GroupATSAccount[]>
   createATSIntegration(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSAccount>
   ): Promise<void>
   saveATSIntegrationTokens(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSIntegrationTokens>
   ): Promise<void>

   /**
    * Should only be called from backends
    * @param groupId
    * @param integrationId
    */
   getATSIntegrationTokens(
      groupId: string,
      integrationId: string
   ): Promise<GroupATSIntegrationTokens>
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
   async getATSIntegrations(groupId: string): Promise<GroupATSAccount[]> {
      const docs = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .get()

      if (docs.empty) {
         return []
      }

      return this.addIdToDocs<GroupATSAccount>(docs.docs)
   }

   createATSIntegration(
      groupId: string,
      integrationId: string,
      data: Partial<GroupATSAccount>
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
      data: Partial<GroupATSIntegrationTokens>
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

      return this.addIdToDoc<GroupATSIntegrationTokens>(doc)
   }
}
