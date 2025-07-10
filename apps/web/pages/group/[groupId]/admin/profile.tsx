import Profile from "../../../../components/views/admin/profile"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"

const AdminProfile = () => {
   return (
      <GroupDashboardLayout titleComponent={"My Profile"}>
         <DashboardHead title="CareerFairy | My Profile" />
         <Profile />
      </GroupDashboardLayout>
   )
}

export default AdminProfile
