import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import AnalyticsLivestreamPageContent from "components/views/group/admin/analytics-new/live-stream"

const LivestreamPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         pageDisplayName={"Live Stream Analytics"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Live Stream Analytics of" />

         <AnalyticsLivestreamPageContent />
      </GroupDashboardLayout>
   )
}

export default LivestreamPage
