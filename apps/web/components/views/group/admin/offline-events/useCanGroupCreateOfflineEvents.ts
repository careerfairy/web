import { useGroup } from "layouts/GroupDashboardLayout"

export const useCanGroupCreateOfflineEvents = () => {
   const { group } = useGroup()

   return group?.availableOfflineEvents > 0
}
