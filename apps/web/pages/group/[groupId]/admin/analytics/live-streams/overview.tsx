import AnalyticsGeneralPageContent from "components/views/group/admin/analytics-new/general"
import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import { useRouter } from "next/router"

const LivestreamPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Analytics"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Live Stream Analytics of" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsGeneralPageContent />
      </GroupDashboardLayout>
   )
}

export default LivestreamPage
