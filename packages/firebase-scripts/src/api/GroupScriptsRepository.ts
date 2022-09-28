import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupFunctionsRepository"
import firebase from "firebase/compat"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
} from "@careerfairy/shared-lib/dist/groups"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import admin = require("firebase-admin")

export interface IGroupScriptsRepository extends IGroupFunctionsRepository {
   getAllAdmins<T extends boolean>(
      withRef?: T
   ): Promise<
      (T extends true
         ? GroupAdmin & {
              _ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
           }
         : GroupAdmin)[]
   >
   getAllAuthUsers(): Promise<admin.auth.UserRecord[]>

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
    * @param group - The group could potentially no longer exist, could have been deleted
    * @param fallbackGroupId - If the group is deleted, we can still use this to remove the user's role from the group's admins sub-collection list
    */
   migrateAdminRole(
      targetEmail: string,
      newRole: GROUP_DASHBOARD_ROLE | null,
      group?: Group,
      fallbackGroupId?: string
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

   async getAllAdmins<T extends boolean>(withRef?: T) {
      const admins = await this.firestore
         .collectionGroup("admins")
         .orderBy("role")
         .get()

      return mapFirestoreDocuments<GroupAdmin, T>(admins, withRef)
   }

   async getAllAuthUsers(): Promise<admin.auth.UserRecord[]> {
      const users = await this.auth.listUsers()
      return users.users
   }

   async migrateAdminRole(
      targetEmail: string,
      newRole: GROUP_DASHBOARD_ROLE | null,
      group?: Group,
      fallbackGroupId?: string
   ) {
      // Get the auth user
      const userData = this.addIdToDoc<UserData>(
         await this.firestore.collection("userData").doc(targetEmail).get()
      )

      const user = await this.auth.getUserByEmail(targetEmail).catch(() => null)
      // console.log("-> user", user)

      if (!user || !group) {
         const groupId = group?.id ?? fallbackGroupId
         // If the user or group doesn't exist, delete the admin role in firestore
         // User does not exist in auth, so remove from group
         const reasons = [
            !user ? "User does not exist in auth" : "",
            !group ? "Group does not exist in firestore" : "",
         ]
         console.log(
            `-> removing admin roles for: ${
               userData.id
            } in group ${groupId} because ${reasons
               .filter(Boolean)
               .join(" and ")}`
         )
         const groupAdminsRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("admins")
            .doc(userData.id)

         const userAdminGroupsRef = this.firestore
            .collection("userData")
            .doc(userData.id)
            .collection("userAdminGroups")
            .doc(groupId)

         return this.firestore.runTransaction(async (t) => {
            t.delete(groupAdminsRef) // Remove the admin doc in careerCenterData/[groupId]/admins/[adminId]
            t.delete(userAdminGroupsRef) // Remove the group doc in userData/userAdminGroups/[group] groups sub-collection
         })
      }

      if (userData.isAdmin) {
         console.log("-> skipping setting claims for admin user", userData.id)
         return
      }

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER FOR EVERY GROUP AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            group.id,
            newRole,
            targetEmail
         )

      if (!thereWillBeAtLeastOneOwner) {
         console.warn(
            `There will be no owner for group ${group.id} after this operation`,
            {
               newRole,
               targetEmail,
               userName: [userData.firstName, userData.lastName].join(" "),
            }
         )
      }

      const oldClaims: admin.auth.UserRecord["customClaims"] = {
         ...user.customClaims,
      }

      await this.setGroupAdminRoleInClaims(user, newRole, group)

      return this.setGroupAdminRoleInFirestore(group, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            this.auth.setCustomUserClaims(user.uid, oldClaims)
            throw error
         }
      )
   }
}
