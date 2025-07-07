import { ReactElement } from "react"
import Profile from "../../../../components/views/admin/profile"
import { withGroupDashboardLayout } from "../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const AdminProfile = () => {
   return <Profile />
}

AdminProfile.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "My Profile",
      dashboardHeadTitle: "CareerFairy | My Profile",
   })(page)
}

export default AdminProfile
