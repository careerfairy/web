import Sparks from "components/views/admin/sparks"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import { useRouter } from "next/router"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"

const AdminSparksPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Sparks"}
         groupId={groupId as string}
         topBarCta={<CreateSparkButton />}
      >
         <DashboardHead title="CareerFairy | My Sparks" />
         <Sparks />
         <SparkPreviewDialog />
      </GroupDashboardLayout>
   )
}

export default AdminSparksPage
