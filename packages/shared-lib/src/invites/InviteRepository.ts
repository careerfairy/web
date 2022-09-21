import firebase from "firebase/compat/app"
import { GroupDashboardInvite, InviteType } from "../groups/Invites"
import { GROUP_DASHBOARD_ROLE } from "../groups"

export interface IInviteRepository {
   createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<void>

   getGroupDashboardInviteById(id: string): Promise<GroupDashboardInvite>

   deleteInviteById(id: string): Promise<void>

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      invitedUserEmail: string
   ): boolean
}

export class FirebaseInviteRepository implements IInviteRepository {
   constructor(
      private readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {}

   createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ) {
      const id = this.firestore.collection("invites").doc().id
      const invite: GroupDashboardInvite = {
         id,
         // @ts-ignore
         createdAt: this.fieldValue.serverTimestamp(),
         details: {
            type: InviteType.GROUP_DASHBOARD,
            receiver: userEmail,
            sender: groupId,
            additionalData: {
               role,
            },
         },
      }
      return this.firestore.collection("invites").doc(id).set(invite)
   }

   async getGroupDashboardInviteById(
      inviteId: string
   ): Promise<GroupDashboardInvite> {
      const doc = await this.firestore.collection("invites").doc(inviteId).get()
      if (doc.exists) {
         return doc.data() as GroupDashboardInvite
      }
      return null
   }

   deleteInviteById(inviteId: string): Promise<void> {
      return this.firestore.collection("invites").doc(inviteId).delete()
   }

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      invitedUserEmail: string
   ): boolean {
      let isValid = false
      if (
         !groupDashboardInvite.details?.receiver ||
         !groupDashboardInvite.details?.sender ||
         !groupDashboardInvite.details?.additionalData ||
         !groupDashboardInvite.details?.type ||
         !invitedUserEmail
      ) {
         return isValid
      }

      return (
         groupDashboardInvite.details.receiver === invitedUserEmail && // check if the invite is for the user
         groupDashboardInvite.details.type === InviteType.GROUP_DASHBOARD && // check if the invite is for the group dashboard
         Object.values(GROUP_DASHBOARD_ROLE).includes(
            groupDashboardInvite.details.additionalData?.role // check if the role is valid
         )
      )
   }
}
