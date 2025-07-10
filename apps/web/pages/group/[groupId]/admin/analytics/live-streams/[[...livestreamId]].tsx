import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import LivestreamAnalyticsPageContent from "../../../../../../components/views/group/admin/analytics-new/live-stream"

const LivestreamPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Analytics"}>
         <DashboardHead title="CareerFairy | Live Stream Analytics of" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <LivestreamAnalyticsNavigationTabs />
         <LivestreamAnalyticsPageContent />
      </GroupDashboardLayout>
   )
}

export default LivestreamPage
