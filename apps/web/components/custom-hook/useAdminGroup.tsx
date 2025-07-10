import { Group } from "@careerfairy/shared-lib/groups"
import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { CAREER_CENTER_COLLECTION } from "../util/constants"
import { useListenToDocument } from "./useListenToDocument"

const useAdminGroup = (
   groupId: string
): { group: Group; stats: GroupStats } => {
   const { data: group } = useListenToDocument<Group>(
      groupId ? `${CAREER_CENTER_COLLECTION}/${groupId}` : null
   )

   const { data: stats } = useListenToDocument<GroupStats>(
      groupId ? `${CAREER_CENTER_COLLECTION}/${groupId}/stats/groupStats` : null
   )

   return { group, stats }
}

export default useAdminGroup
