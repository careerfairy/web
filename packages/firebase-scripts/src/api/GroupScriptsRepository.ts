import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupFunctionsRepository"
import firebase from "firebase/compat"
import {
   mapFirestoreDocuments,
   DocRef,
} from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   LegacyGroupAdmin,
} from "@careerfairy/shared-lib/dist/groups"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import admin = require("firebase-admin")

export interface IGroupScriptsRepository extends IGroupFunctionsRepository {
   getAllLegacyAdmins<T extends boolean>(
      withRef?: T
   ): Promise<(T extends true ? LegacyGroupAdmin & DocRef : LegacyGroupAdmin)[]>

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
}

export class GroupScriptsRepository
   extends GroupFunctionsRepository
   implements IGroupScriptsRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue,
      protected readonly auth: admin.auth.Auth
   ) {
      super(firestore, fieldValue, auth)
   }

   async getAllLegacyAdmins<T extends boolean>(withRef?: T) {
      const admins = await this.firestore.collectionGroup("admins").get()
      return mapFirestoreDocuments<LegacyGroupAdmin, T>(admins, withRef)
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
               `-> removing admin roles for ${
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

      if (!thereWillBeAtLeastOneOwner) {
         newRole = GROUP_DASHBOARD_ROLE.OWNER
         console.warn(
            `There will be no owner for group ${group.id} after this operation, will make them an owner`,
            {
               newRole,
               targetEmail,
               userName: [userData.firstName, userData.lastName].join(" "),
            }
         )
      }

      await this.setGroupAdminRoleInClaims(user, newRole, group)

      return this.setGroupAdminRoleInFirestore(group, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            this.auth.setCustomUserClaims(user.uid, user.customClaims)
            throw error
         }
      )
   }
}
