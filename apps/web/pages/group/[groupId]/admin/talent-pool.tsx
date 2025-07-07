import AnalyticsTalentPoolPageContent from "components/views/group/admin/analytics-new/talent-pool"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"

const TalentPoolPage = () => {
   return <AnalyticsTalentPoolPageContent />
}

TalentPoolPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Talent Pool",
      dashboardHeadTitle: "CareerFairy | Talent Pool of",
   })(page)
}

export default TalentPoolPage
