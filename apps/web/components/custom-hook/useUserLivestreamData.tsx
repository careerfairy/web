import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { doc } from "firebase/firestore"
import { useFirestore, useFirestoreDocDataOnce } from "reactfire"

/**
 * Fetch the livestream UserLivestreamData document
 *
 * @param livestreamId
 * @param userId
 */
const useUserLivestreamData = (
   livestreamId,
   userId: string
): UserLivestreamData => {
   const ref = doc(
      useFirestore(),
      "livestreams",
      livestreamId,
      "userLivestreamData",
      userId
   )

   const { data } = useFirestoreDocDataOnce<UserLivestreamData>(ref as any, {
      idField: "id",
   })

   return data
}

export default useUserLivestreamData
