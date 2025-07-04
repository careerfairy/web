import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import { useRouter } from "next/router"
import AnalyticsFeedbackPageContent from "../../../../../../../components/views/group/admin/analytics-new/feedback"
import GroupDashboardLayout from "../../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../../layouts/GroupDashboardLayout/DashboardHead"

const FeedbackPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Analytics"}
         serverGroupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Feedback of" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsFeedbackPageContent />
      </GroupDashboardLayout>
   )
}

export default FeedbackPage
