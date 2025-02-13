import { Group } from "@careerfairy/shared-lib/groups"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to get a group from the database
 **/
const useGroup = (groupId: string, disableSuspense?: boolean) => {
   return useFirestoreDocument<Group>("careerCenterData", [groupId], {
      idField: "id",
      suspense: !disableSuspense,
   })
}

export default useGroup
