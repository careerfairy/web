import { LivestreamCTAUserInteraction } from "@careerfairy/shared-lib/livestreams"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collectionGroup, query, where } from "firebase/firestore"
import { useMemo } from "react"

export const useUserLivestreamCTA = (livestreamId: string, userId: string) => {
   const userCTAInteractionsQuery = useMemo(() => {
      return query(
         collectionGroup(FirestoreInstance, "usersWhoInteracted"),
         where("livestreamId", "==", livestreamId),
         where("userId", "==", userId)
      )
   }, [userId, livestreamId])

   return useFirestoreCollection<LivestreamCTAUserInteraction>(
      userCTAInteractionsQuery,
      {
         idField: "id",
         suspense: false,
      }
   )
}
