import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import AnalyticsRegistrationSourcesPageContent from "components/views/group/admin/analytics-new/registration-sources"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import { useRouter } from "next/router"

const RegistrationSourcesPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Analytics"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Registration Sources of" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsRegistrationSourcesPageContent />
      </GroupDashboardLayout>
   )
}

export default RegistrationSourcesPage
