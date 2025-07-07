import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"
import LivestreamAnalyticsPageContent from "../../../../../../components/views/group/admin/analytics-new/live-stream"

const LivestreamPage = () => {
   return <LivestreamAnalyticsPageContent />
}

LivestreamPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Live Stream Analytics of",
      subNavigationFor: "analytics",
   })(page)
}

export default LivestreamPage
