import type firebase from "firebase/compat"
import { MergeATSRepository } from "./MergeATSRepository"
import { MockedMergeATSRepository } from "./MockedMergeATSRepository"

export function getATSRepository(
   apiKey: string,
   accountToken?: string,
   firestore?: firebase.firestore.Firestore
) {
   if (process.env.APP_ENV === "test") {
      return new MockedMergeATSRepository()
   } else {
      return new MergeATSRepository(apiKey, accountToken, firestore)
   }
}
