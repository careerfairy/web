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
import { GroupDashboardInvite } from "@careerfairy/shared-lib/dist/groups/GroupDashboardInvite"
import { UserData } from "@careerfairy/shared-lib/dist/users"

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

   createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<GroupDashboardInvite>

   getGroupDashboardInviteById(id: string): Promise<GroupDashboardInvite>

   deleteGroupDashboardInviteById(id: string): Promise<void>

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      currentUserEmail: string
   ): boolean
}

export class GroupFunctionsRepository
   extends FirebaseGroupRepository
   implements IGroupFunctionsRepository
{
   async setGroupAdminRole(
      groupId: string,
      userData: UserData,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<void> {
      const dataToSave: GroupAdmin = {
         role,
         email: userData.id,
         firstName: userData.firstName || "",
         lastName: userData.lastName || "",
         id: userData.id,
      }
      return this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("admins")
         .doc(userData.id)
         .set(dataToSave, { merge: true })
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
      const userSnap = await this.firestore
         .collection("userData")
         .doc(targetEmail)
         .get()
      const userData = this.addIdToDoc<UserData>(userSnap)
      const user = await admin.auth().getUserByEmail(targetEmail)

      const currentAdmins = (await this.getGroupAdmins(groupId)) || []

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER FOR EVERY GROUP AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            groupId,
            newRole,
            targetEmail,
            currentAdmins
         )

      if (!thereWillBeAtLeastOneOwner) {
         throw new Error(
            "Cannot remove the last owner of the group. There must be at least one owner."
         )
      }

      const oldClaims = { ...user.customClaims } || {}

      await admin.auth().setCustomUserClaims(user.uid, {
         adminGroups: {
            ...oldClaims.adminGroups,
            [groupId]: {
               role: newRole,
            },
         },
      })

      await this.setGroupAdminRole(groupId, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            admin.auth().setCustomUserClaims(user.uid, oldClaims)
            throw error
         }
      )

      return this.firestore.collection("userData").doc(targetEmail).update({
         refreshTokenTime: admin.firestore.FieldValue.serverTimestamp(), // update the user's refresh token time to force a refresh of the user's custom claims in the auth provider
      })
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
      userEmail: string,
      currentAdmins: GroupAdmin[]
   ) {
      const potentialNewAdmins: Partial<GroupAdmin>[] = [
         ...currentAdmins.filter((admin) => admin.id !== userEmail),
         // add the new admin to the list of current admins if it's not already there
         { id: userEmail, role: newRole },
      ]

      const totalOwners = potentialNewAdmins.filter(
         (admin) => admin.role === GROUP_DASHBOARD_ROLE.OWNER || "mainAdmin" // TODO: remove this legacy "mainAdmin string when we remove the mainAdmin role after migration
      )

      return totalOwners.length > 0 // there must be at least one owner
   }

   async createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<GroupDashboardInvite> {
      const id = this.firestore.collection("invites").doc().id
      const invite: GroupDashboardInvite = {
         id,
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-ignore
         createdAt: this.fieldValue.serverTimestamp(),
         invitedEmail: userEmail,
         groupId,
         role: role || GROUP_DASHBOARD_ROLE.MEMBER,
      }
      await this.firestore
         .collection("groupDashboardInvites")
         .doc(id)
         .set(invite)
      return invite
   }

   async getGroupDashboardInviteById(
      inviteId: string
   ): Promise<GroupDashboardInvite> {
      const doc = await this.firestore
         .collection("groupDashboardInvites")
         .doc(inviteId)
         .get()
      if (doc.exists) {
         return doc.data() as GroupDashboardInvite
      }
      return null
   }

   deleteGroupDashboardInviteById(inviteId: string): Promise<void> {
      return this.firestore
         .collection("groupDashboardInvites")
         .doc(inviteId)
         .delete()
   }

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      currentUserEmail: string
   ): boolean {
      return Boolean(
         groupDashboardInvite.invitedEmail &&
            groupDashboardInvite.groupId &&
            groupDashboardInvite.role &&
            currentUserEmail
      )
   }
}
