import { LivestreamAnalyticsNavigationTabs } from "layouts/GroupDashboardLayout/LivestreamAnalyticsNavigationTabs"
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
         titleComponent={"Feedback"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Feedback of" />
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsFeedbackPageContent />
      </GroupDashboardLayout>
   )
}

export default FeedbackPage
