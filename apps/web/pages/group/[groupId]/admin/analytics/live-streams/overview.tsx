import AnalyticsGeneralPageContent from "components/views/group/admin/analytics-new/general"
import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"

const LivestreamPage = () => {
   return (
      <>
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsGeneralPageContent />
      </>
   )
}

LivestreamPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Live Stream Analytics of",
      subNavigationFor: "analytics",
   })(page)
}

export default LivestreamPage
