import { Group } from "@careerfairy/shared-lib/groups"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to get a group from the database
 **/
const useGroup = (groupId: string) => {
   return useFirestoreDocument<Group>("careerCenterData", [groupId], {
      idField: "id",
      suspense: true,
   })
}

export default useGroup
