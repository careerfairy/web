import Sparks from "components/views/admin/sparks"
import CreateSparkButton from "components/views/admin/sparks/CreateSparkButton"
import { useRouter } from "next/router"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"

const AdminSparksPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         pageDisplayName={"Sparks"}
         groupId={groupId as string}
         topBarCta={<CreateSparkButton />}
      >
         <DashboardHead title="CareerFairy | My Sparks" />
         <Sparks />
      </GroupDashboardLayout>
   )
}

export default AdminSparksPage
