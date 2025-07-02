import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import { SparksAnalyticsProvider } from "components/views/admin/sparks/analytics/SparksAnalyticsContext"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import SparksDialog from "components/views/admin/sparks/sparks-dialog/SparksDialog"
import { useRouter } from "next/router"
import { FC } from "react"
import GroupDashboardLayout from "../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../layouts/GroupDashboardLayout/DashboardHead"

const CreateSparkButtonWrapper: FC = () => {
   return (
      <>
         <CreateSparkButton />
         <SparksDialog />
      </>
   )
}

const AdminSparksAnalyticsPage: FC = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Analytics"}
         groupId={groupId as string}
         topBarCta={<CreateSparkButtonWrapper />}
      >
         <DashboardHead title="CareerFairy | My Sparks Analytics" />
         <SparksAnalyticsProvider>
            <GroupSparkAnalytics />
         </SparksAnalyticsProvider>
      </GroupDashboardLayout>
   )
}

export default AdminSparksAnalyticsPage
