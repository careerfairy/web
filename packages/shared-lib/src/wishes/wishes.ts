import { Identifiable } from "../commonTypes"
import firebase from "firebase"

export interface Wish extends Identifiable {
   createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue
   updatedAt:
      | firebase.firestore.Timestamp
      | null
      | firebase.firestore.FieldValue
   flaggedByAdminAt:
      | firebase.firestore.Timestamp
      | null
      | firebase.firestore.FieldValue
   deletedAt:
      | firebase.firestore.Timestamp
      | null
      | firebase.firestore.FieldValue
   numberOfUpvotes: number | firebase.firestore.FieldValue
   numberOfDownvotes: number | firebase.firestore.FieldValue
   numberOfComments: number | firebase.firestore.FieldValue
   numberOfViews: number | firebase.firestore.FieldValue
   numberOfFlags: number | firebase.firestore.FieldValue
   title: string
   category: "company" | "other"
   authorUid: string
   companyNames: string[]
   isPublic: boolean
   isDeleted: boolean
   isFlaggedByAdmin: boolean
   // array of interests ids
   interests: string[]
}
export type WishOrderByFields =
   | Wish["createdAt"]
   | Wish["updatedAt"]
   | Wish["deletedAt"]
   | Wish["flaggedByAdminAt"]
   | Wish["title"]
   | Wish["numberOfDownvotes"]
   | Wish["numberOfUpvotes"]
   | Wish["numberOfComments"]
   | Wish["numberOfViews"]
   | Wish["numberOfFlags"]

export type FlagReason =
   | "unrelated"
   | "spam"
   | "inappropriate"
   | "duplicate"
   | "other"

export interface Flag {
   reasons: FlagReason[]
   createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue
}
export interface Rating {
   type: "upvote" | "downvote"
   createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue
}
