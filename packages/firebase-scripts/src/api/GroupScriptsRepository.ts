import firebase from "firebase/compat"
import {
   DocRef,
   mapFirestoreDocuments,
} from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
   LegacyGroupAdmin,
} from "@careerfairy/shared-lib/dist/groups"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import { DataWithRef } from "../util/types"
import { GroupStats } from "@careerfairy/shared-lib/dist/groups/stats"
import admin = require("firebase-admin")

export interface IGroupScriptsRepository extends IGroupRepository {
   getAllLegacyAdmins<T extends boolean>(
      withRef?: T
   ): Promise<(T extends true ? LegacyGroupAdmin & DocRef : LegacyGroupAdmin)[]>

   getAllGroupAdmins<T extends boolean>(
      withRef?: T
   ): Promise<(T extends true ? GroupAdmin & DocRef : GroupAdmin)[]>

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
    *
    * @param targetEmail
    * @param newRole
    * @param fallbackGroupId - If the group is deleted, we can still use this to remove the user's role from the group's admins sub-collection list
    * @param group - The group could potentially no longer exist, could have been deleted
    */
   migrateAdminRole(
      targetEmail: string,
      newRole: GROUP_DASHBOARD_ROLE | null,
      fallbackGroupId: string,
      group?: Group
   ): Promise<void>

   getAllGroupStats<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, GroupStats>[]>

   getAllGroups<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, Group>[]>
}

export class GroupScriptsRepository
   extends FirebaseGroupRepository
   implements IGroupScriptsRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue,
      protected readonly auth: admin.auth.Auth
   ) {
      super(firestore, fieldValue)
   }

   async getAllLegacyAdmins<T extends boolean>(withRef?: T) {
      const admins = await this.firestore
         .collectionGroup("admins")
         .orderBy("role", "asc")
         .get()
      return mapFirestoreDocuments<LegacyGroupAdmin, T>(admins, withRef)
   }

   async getAllGroupAdmins<T extends boolean>(withRef?: T) {
      const admins = await this.firestore.collectionGroup("groupAdmins").get()
      return mapFirestoreDocuments<GroupAdmin, T>(admins, withRef)
   }

   async migrateAdminRole(
      targetEmail: string,
      newRole: GROUP_DASHBOARD_ROLE | null,
      fallbackGroupId: string,
      group?: Group
   ) {
      // Get the auth user
      const userData = this.addIdToDoc<UserData>(
         await this.firestore.collection("userData").doc(targetEmail).get()
      )

      const user = await this.auth.getUserByEmail(targetEmail).catch(() => null)

      if (!user || !group || userData.isAdmin) {
         // If the group or users no longer exists, we can still use this to remove the user's role from the group's admins sub-collection list

         const groupId = group?.id ?? fallbackGroupId

         // If the user or group doesn't exist, delete the admin role in firestore
         // User does not exist in auth, so remove from group
         const reasons = [
            !user ? "User does not exist in auth" : "",
            !group ? "Group does not exist in firestore" : "",
            userData.isAdmin
               ? "User is a CF admin (Already has access to all dashboards)"
               : "",
         ]

         const onlyReasonIsBecauseUserIsCFAdmin =
            reasons.filter(Boolean).length === 1 && reasons[2]

         if (!onlyReasonIsBecauseUserIsCFAdmin) {
            // We skip logging if the only reason is that the user is a CF admin
            console.info(
               `-> skipping setting admin roles for ${
                  userData.id
               } in group ${groupId} because ${reasons
                  .filter(Boolean)
                  .join(" and ")}`
            )
         }

         const groupAdminsRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("groupAdmins")
            .doc(userData.id)

         const userAdminGroupsRef = this.firestore
            .collection("userData")
            .doc(userData.id)
            .collection("userAdminGroups")
            .doc(groupId)

         return this.firestore.runTransaction(async (t) => {
            // this is a cleanup script, in-case we run the script again
            t.delete(groupAdminsRef) // Remove the admin doc in careerCenterData/[groupId]/groupAdmins/[adminId]
            t.delete(userAdminGroupsRef) // Remove the group doc in userData/userAdminGroups/[group] groups sub-collection
         })
      }

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER FOR EVERY GROUP AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            group.id,
            newRole,
            targetEmail
         )

      if (!thereWillBeAtLeastOneOwner && newRole) {
         newRole = GROUP_DASHBOARD_ROLE.OWNER // There will be no owner for group ${group.id} after this operation, so will make them an owner by default
      }

      const oldClaims = { ...user.customClaims }
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
         delete newClaims.adminGroups[group.id]
      }

      await this.auth.setCustomUserClaims(user.uid, newClaims)

      return this.setGroupAdminRoleInFirestore(group, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            this.auth.setCustomUserClaims(user.uid, user.customClaims)
            throw error
         }
      )
   }

   async getAllGroupStats<T extends boolean>(withRef?: T) {
      const groupStats = await this.firestore
         .collectionGroup("stats")
         .where("id", "==", "groupStats")
         .get()
      return mapFirestoreDocuments<GroupStats, T>(groupStats, withRef)
   }

   async getAllGroups<T extends boolean>(withRef?: T) {
      const groups = await this.firestore.collection("careerCenterData").get()
      return mapFirestoreDocuments<Group, T>(groups, withRef)
   }
}
