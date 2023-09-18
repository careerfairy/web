import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { BackLink } from "layouts/GroupDashboardLayout/TopBar"
import { useRouter } from "next/router"

const AdminLivestreamPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={<BackLink>Live Stream Details</BackLink>}
         groupId={groupId as string}
         topBarCta={<LivestreamButtonActions />}
      >
         <DashboardHead title="CareerFairy | Live Stream Details" />
      </GroupDashboardLayout>
   )
}

export default AdminLivestreamPage
