import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { ReactFireOptions } from "reactfire"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

export const useUserLivestreamData = (
   livestreamId: string,
   userId: string,
   options?: ReactFireOptions
) => {
   return useFirestoreDocument<UserLivestreamData>(
      "livestreams",
      [livestreamId, "userLivestreamData", userId],
      {
         idField: "id",
         suspense: true,
         ...options,
      }
   )
}
