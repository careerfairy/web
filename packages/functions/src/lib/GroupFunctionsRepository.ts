import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import {
   Group,
   GroupAdmin,
   GROUP_DASHBOARD_ROLE,
} from "@careerfairy/shared-lib/dist/groups"
import { admin } from "../api/firestoreAdmin"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

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
    * Grants a user admin access to a group and a role
    *
    * What it does:
    * 1. Assigns a role to the group in the user's auth custom claims
    * 2. Adds the user's role to the group's admins sub-collection list for querying of group admins in group/[groupId]/admin/roles
    * @param email
    * @param groupId
    * @param role
    */
   grantGroupAdminRole(
      email: string,
      groupId: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<void>

   /*
    * Gets the admins of a group document
    * */
   getGroupAdmins(groupId: string): Promise<GroupAdmin[]>
}

export class GroupFunctionsRepository
   extends FirebaseGroupRepository
   implements IGroupFunctionsRepository
{
   async setGroupAdminRole(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<void> {
      return this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("admins")
         .doc(userEmail)
         .set({ role })
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
      const user = await admin.auth().getUserByEmail(userEmail) //

      const userRole = user.customClaims?.[group.id]?.role

      return {
         isAdmin: Object.values(GROUP_DASHBOARD_ROLE).includes(userRole),
         group,
         role: userRole,
      }
   }

   async grantGroupAdminRole(
      targetEmail: string,
      groupId: string,
      newRole: GROUP_DASHBOARD_ROLE
   ) {
      // Get the auth user
      const user = await admin.auth().getUserByEmail(targetEmail)

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            groupId,
            newRole,
            targetEmail
         )

      if (!thereWillBeAtLeastOneOwner) {
         throw new Error(
            "Cannot remove the last owner of the group. There must be at least one owner."
         )
      }

      await admin.auth().setCustomUserClaims(user.uid, {
         groupAdmins: {
            ...user.customClaims.groupAdmins,
            [groupId]: {
               role: newRole,
            },
         },
      })

      return this.setGroupAdminRole(groupId, targetEmail, newRole)
   }

   async getGroupAdmins(groupId: string): Promise<GroupAdmin[]> {
      const adminsSnap = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("admins")
         .get()

      return mapFirestoreDocuments(adminsSnap)
   }

   async checkIfThereWillBeAtLeastOneOwner(
      groupId: string,
      newRole: GROUP_DASHBOARD_ROLE,
      userEmail: string
   ) {
      // get the current Admins of the group
      const currentAdmins = (await this.getGroupAdmins(groupId)) || []

      const potentialNewAdmins: GroupAdmin[] = [
         ...currentAdmins.filter((admin) => admin.id !== userEmail),
         // add the new admin to the list of current admins if it's not already there
         { id: userEmail, role: newRole },
      ]

      const totalOwners = potentialNewAdmins.filter(
         (admin) => admin.role === GROUP_DASHBOARD_ROLE.OWNER
      )

      return totalOwners.length > 0 // there must be at least one owner
   }
}
