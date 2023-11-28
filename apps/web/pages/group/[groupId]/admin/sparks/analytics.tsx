import { FC } from "react"
import { useRouter } from "next/router"
import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"

const AdminSparksAnalyticsPage: FC = () => {
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
