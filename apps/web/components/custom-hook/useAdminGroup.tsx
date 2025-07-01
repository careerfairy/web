import { Group } from "@careerfairy/shared-lib/groups"
import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { CAREER_CENTER_COLLECTION } from "../util/constants"
import { useFirestoreDocument } from "./utils/useFirestoreDocument"

const useAdminGroup = (
   groupId: string
): { group: Group; stats: GroupStats } => {
   const { data: group } = useFirestoreDocument<Group>(
      CAREER_CENTER_COLLECTION,
      [groupId],
      {
         idField: "id",
      }
   )

   const { data: stats } = useFirestoreDocument<GroupStats>(
      CAREER_CENTER_COLLECTION,
      [groupId, "stats", "groupStats"],
      {
         idField: "id",
      }
   )

   return { group, stats }
}

export default useAdminGroup
