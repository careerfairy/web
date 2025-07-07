import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import AnalyticsRegistrationSourcesPageContent from "components/views/group/admin/analytics-new/registration-sources"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"

const RegistrationSourcesPage = () => {
   return (
      <>
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsRegistrationSourcesPageContent />
      </>
   )
}

RegistrationSourcesPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Registration Sources of",
      subNavigationFor: "analytics",
   })(page)
}

export default RegistrationSourcesPage
