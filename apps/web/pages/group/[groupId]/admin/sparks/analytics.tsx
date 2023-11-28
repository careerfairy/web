import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import { useRouter } from "next/router"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import GroupSparkAnalytics from "components/views/admin/sparks/analytics"

const AdminSparksAnalyticsPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Sparks Analytics"}
         groupId={groupId as string}
         topBarCta={<CreateSparkButton />}
      >
         <DashboardHead title="CareerFairy | My Sparks Analytics" />
         <GroupSparkAnalytics />
      </GroupDashboardLayout>
   )
}

export default AdminSparksAnalyticsPage
