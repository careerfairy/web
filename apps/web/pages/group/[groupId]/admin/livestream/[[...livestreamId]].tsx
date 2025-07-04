import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { BackLink } from "layouts/GroupDashboardLayout/TopBar"

const AdminLivestreamPage = () => {
   return (
      <GroupDashboardLayout
         titleComponent={<BackLink>Live Stream Details</BackLink>}
         topBarCta={<LivestreamButtonActions />}
      >
         <DashboardHead title="CareerFairy | Live Stream Details" />
      </GroupDashboardLayout>
   )
}

export default AdminLivestreamPage
