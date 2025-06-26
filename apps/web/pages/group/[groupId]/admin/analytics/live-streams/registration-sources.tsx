import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import AnalyticsRegistrationSourcesPageContent from "components/views/group/admin/analytics-new/registration-sources"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"

const RegistrationSourcesPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Analytics"}>
         <DashboardHead title="CareerFairy | Registration Sources of" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsRegistrationSourcesPageContent />
      </GroupDashboardLayout>
   )
}

export default RegistrationSourcesPage
