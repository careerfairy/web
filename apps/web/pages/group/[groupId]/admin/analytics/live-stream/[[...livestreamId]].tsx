import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import LivestreamAnalyticsPageContent from "../../../../../../components/views/group/admin/analytics-new/live-stream"
import { useRouter } from "next/router"

const LivestreamPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Live Stream Analytics"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Live Stream Analytics of" />

         <LivestreamAnalyticsPageContent />
      </GroupDashboardLayout>
   )
}

export default LivestreamPage
