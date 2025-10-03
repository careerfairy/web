import { OfflineEventsOverview } from "components/views/group/admin/offline-events/OfflineEventsOverview"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"

const OfflineEventsPage = () => <OfflineEventsOverview />

OfflineEventsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Content",
      dashboardHeadTitle: "CareerFairy | My Offline Events",
      subNavigationFor: "content",
   })(page)
}

export default OfflineEventsPage
