import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"
import OfflineEventAnalyticsPageContent from "../../../../../../components/views/group/admin/analytics-new/offline-event"

const OfflineEventPage = () => {
   return <OfflineEventAnalyticsPageContent />
}

OfflineEventPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Offline Event Analytics of",
      subNavigationFor: "analytics",
   })(page)
}

export default OfflineEventPage
