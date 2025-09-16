import { useGroup } from "layouts/GroupDashboardLayout"

export const OfflineEventsOverview = () => {
   const { group } = useGroup()
   return <div>OfflineEventsOverview 3; {group.universityName}</div>
}
