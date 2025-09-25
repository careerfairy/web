import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat/app"
import { Interest } from "../interests"

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
   description: string
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
   // array of interest documents
   interests: Interest[]
}

export type WishOrderByFields =
   | Wish["createdAt"]
   | Wish["updatedAt"]
   | Wish["deletedAt"]
   | Wish["flaggedByAdminAt"]
   | Wish["description"]
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
   message?: string
}
export interface Rating {
   type: "upvote" | "downvote" | null
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
   numberOfFlags: number | firebase.firestore.FieldValue
   numberOfReplies: number | firebase.firestore.FieldValue
   numberOfUpvotes: number | firebase.firestore.FieldValue
   isDeleted: boolean
   isFlaggedByAdmin: boolean
   wishId: string
   parentCommentId: string | null
}

// TODO: this should be moved to the web-app since its a UI detail
export interface CreateWishFormValues {
   description: Wish["description"]
   interests: Interest[]
   companyNames: Wish["companyNames"]
}
