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
   numberOfUpvotes: number
   numberOfDownvotes: number
   numberOfComments: number
   numberOfViews: number
   numberOfFlags: number
   title: string
   category: WishCategories
   authorUid: string
   companyNames: string[]
   /*
    * This field should only be updated by a trigger
    * cloud function that listens to new upvotes.
    * It should also be limited to ONLY the 4 most recent
    * upvotes.
    * */
   uidsOfRecentUpvoters: string[]
   isPublic: boolean
   isDeleted: boolean
   isFlaggedByAdmin: boolean
   // array of interests ids
   interestIds: string[]
}

export enum WishCategories {
   COMPANY = "company",
   OTHER = "other",
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

export interface Comment extends Identifiable {
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
   authorUid: string
   text: string
   numberOfFlags: number
   numberOfReplies: number
   numberOfUpvotes: number
   isDeleted: boolean
   isFlaggedByAdmin: boolean
   wishId: string
   parentCommentId: string | null
}
