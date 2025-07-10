import CompanyInformationPageContent from "components/views/group/admin/company-information"
import { ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const GeneralSettingsPage = () => {
   return <CompanyInformationPageContent />
}

GeneralSettingsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Settings",
      dashboardHeadTitle: "CareerFairy | Admin Edit Details of",
      subNavigationFor: "settings",
   })(page)
}

export default GeneralSettingsPage
