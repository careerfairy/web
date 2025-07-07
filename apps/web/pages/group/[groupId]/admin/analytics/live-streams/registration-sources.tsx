import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"
import RegistrationSourcesPageContent from "../../../../../../components/views/group/admin/analytics-new/registration-sources"

const RegistrationSourcesPage = () => {
   return <RegistrationSourcesPageContent />
}

RegistrationSourcesPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | Registration Sources of",
      subNavigationFor: "analytics",
   })(page)
}

export default RegistrationSourcesPage
