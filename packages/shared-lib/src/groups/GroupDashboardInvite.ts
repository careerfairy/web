import firebase from "firebase/compat"
import Timestamp = firebase.firestore.Timestamp
import { Identifiable } from "../commonTypes"
import { GROUP_DASHBOARD_ROLE } from "./index"

// Collection groupInvites/[inviteId]
export interface GroupDashboardInvite extends Identifiable {
   createdAt: Timestamp
   /**
    * The ID of the group.
    */
   groupId: string
   /**
    * The email of the user that will be invited.
    */
   invitedEmail: string
   role: GROUP_DASHBOARD_ROLE
}
