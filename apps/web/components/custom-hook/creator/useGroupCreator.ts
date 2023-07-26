import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

const useGroupCreator = (groupId: string, creatorId: string) => {
   return useFirestoreDocument<Creator>(
      "careerCenterData",
      [groupId, "creators", creatorId],
      {
         idField: "id",
      }
   )
}

export default useGroupCreator
