import { LivestreamAnalyticsNavigationTabs } from "components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import { ReactElement } from "react"
import AnalyticsFeedbackPageContent from "../../../../../../../components/views/group/admin/analytics-new/feedback"
import { withGroupDashboardLayout } from "../../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const FeedbackPage = () => {
   return (
      <>
         <LivestreamAnalyticsNavigationTabs />
         <AnalyticsFeedbackPageContent />
      </>
   )
}

FeedbackPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Feedback of",
      subNavigationFor: "analytics",
   })(page)
}

export default FeedbackPage
