import Sparks from "components/views/admin/sparks"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { HasAccessToSparksWrapper } from "layouts/GroupDashboardLayout/HasAccessToSparksWrapper"
import { ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const AdminSparksPage = () => {
   return (
      <HasAccessToSparksWrapper>
         <Sparks />
         <SparkPreviewDialog />
      </HasAccessToSparksWrapper>
   )
}

AdminSparksPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Content",
      topBarCta: <CreateSparkButton size="large" />,
      dashboardHeadTitle: "CareerFairy | My Sparks",
      subNavigationFor: "content",
   })(page)
}

export default AdminSparksPage
