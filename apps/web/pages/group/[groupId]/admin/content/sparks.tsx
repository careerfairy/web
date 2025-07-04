import Sparks from "components/views/admin/sparks"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"

const AdminSparksPage = () => {
   return (
      <GroupDashboardLayout
         titleComponent={"Content"}
         topBarCta={<CreateSparkButton size="large" />}
      >
         <DashboardHead title="CareerFairy | My Sparks" />
         <SubNavigationTabs showSubNavigationFor="content" />
         <Sparks />
         <SparkPreviewDialog />
      </GroupDashboardLayout>
   )
}

export default AdminSparksPage
