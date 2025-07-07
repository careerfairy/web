import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"
import FeedbackPageContent from "../../../../../../../components/views/group/admin/analytics-new/feedback"

const FeedbackPage = () => {
   return <FeedbackPageContent />
}

FeedbackPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Feedback of",
      subNavigationFor: "analytics",
   })(page)
}

export default FeedbackPage
