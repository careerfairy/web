import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"
import { ReactFireOptions } from "reactfire"

const useGroupCreator = (
   groupId: string,
   creatorId: string,
   options?: ReactFireOptions
) => {
   return useFirestoreDocument<Creator>(
      "careerCenterData",
      [groupId, "creators", creatorId],
      {
         idField: "id",
         ...options,
      }
   )
}

export default useGroupCreator
