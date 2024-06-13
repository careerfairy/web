import firebase from "firebase/compat/app"
import { Identifiable } from "../commonTypes"
import { GROUP_DASHBOARD_ROLE } from "./index"
import Timestamp = firebase.firestore.Timestamp

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

export const WRONG_EMAIL_IN_INVITE_ERROR_MESSAGE =
   "Your email is different from the invited Personal Account's email. Please use the proper Personal Account to log in or create one using the proper email."

export const NO_EMAIL_ASSOCIATED_WITH_INVITE_ERROR_MESSAGE =
   "No email is associated with this invite."
