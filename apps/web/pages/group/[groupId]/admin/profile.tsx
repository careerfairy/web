import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import Profile from "../../../../components/views/admin/profile"

const AdminProfile = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         pageDisplayName={"My Profile"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | My Profile" />
         <Profile />
      </GroupDashboardLayout>
   )
}

export default AdminProfile
