import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"

export const useParticipatingUsers = (livestreamId: string) => {
   const q = query(
      collection(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "userLivestreamData"
      ),
      where(`participated.date`, "!=", null),
      orderBy("participated.date")
   )
   return useFirestoreCollection<UserLivestreamData>(q)
}
