import { ReactElement } from "react"
import RolesOverview from "../../../../../components/views/group/admin/roles"
import { withGroupDashboardLayout } from "../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const TeamMembersPage = () => {
   return <RolesOverview />
}

TeamMembersPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Settings",
      dashboardHeadTitle: "CareerFairy | Member Roles of",
      subNavigationFor: "settings",
   })(page)
}

export default TeamMembersPage
