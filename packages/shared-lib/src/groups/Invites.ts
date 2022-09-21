import firebase from "firebase/compat"
import Timestamp = firebase.firestore.Timestamp
import { Identifiable } from "../commonTypes"
import { GROUP_DASHBOARD_ROLE } from "./index"

export enum InviteType {
   GROUP_DASHBOARD = "GROUP_DASHBOARD",
}

export interface GroupDashboardInvite extends Identifiable {
   createdAt: Timestamp
   details: {
      type: InviteType.GROUP_DASHBOARD
      /**
       * The ID of the group.
       */
      sender: string
      /**
       * The email of the user that will be invited.
       */
      receiver: string
      additionalData: {
         role: GROUP_DASHBOARD_ROLE
      }
   }
}
