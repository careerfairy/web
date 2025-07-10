import MainPageContent from "components/views/group/admin/main"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { ReactElement } from "react"

const MainPage = () => {
   return <MainPageContent />
}

MainPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Dashboard",
      dashboardHeadTitle: "CareerFairy | Dashboard of",
   })(page)
}

export default MainPage
