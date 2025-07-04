import AnalyticsGeneralPageContent from "components/views/group/admin/analytics-new/general"
import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"

const LivestreamPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Analytics"}>
         <DashboardHead title="CareerFairy | Live Stream Analytics of" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsGeneralPageContent />
      </GroupDashboardLayout>
   )
}

export default LivestreamPage
