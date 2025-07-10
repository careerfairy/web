import Sparks from "components/views/admin/sparks"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import { SparksPromotionalPage } from "components/views/admin/sparks/components/promotional-page/SparksPromotionalPage"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment, ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const AdminSparksPage = () => {
   const { group } = useGroup()
   const hasAccessToSparks = useHasAccessToSparks()

   if (!group) return null
   if (!hasAccessToSparks) return <SparksPromotionalPage />

   return (
      <Fragment>
         <Fragment>
            <Sparks />
            <SparkPreviewDialog />
         </Fragment>
      </Fragment>
   )
}

const ConditionalCreateSparkButton = () => {
   const hasAccessToSparks = useHasAccessToSparks()

   return hasAccessToSparks ? <CreateSparkButton size="large" /> : null
}

AdminSparksPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Content",
      topBarCta: <ConditionalCreateSparkButton />,
      dashboardHeadTitle: "CareerFairy | My Sparks",
      subNavigationFor: "content",
   })(page)
}

export default AdminSparksPage
