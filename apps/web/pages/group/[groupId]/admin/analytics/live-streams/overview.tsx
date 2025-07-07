import AnalyticsGeneralPageContent from "components/views/group/admin/analytics-new/general"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"

const LivestreamPage = () => {
   return <AnalyticsGeneralPageContent />
}

LivestreamPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Live Stream Analytics of",
      subNavigationFor: "analytics",
   })(page)
}

export default LivestreamPage
