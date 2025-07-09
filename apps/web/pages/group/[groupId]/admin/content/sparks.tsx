import { useFeatureFlags } from "components/custom-hook/useFeatureFlags"
import Sparks from "components/views/admin/sparks"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import { SparksPromotionalPage } from "components/views/admin/sparks/components/promotional-page/SparksPromotionalPage"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment, ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const AdminSparksPage = () => {
   const { group } = useGroup()
   const featureFlags = useFeatureFlags()

   if (!group) return null

   const hasAccessToSparks =
      featureFlags?.sparksAdminPageFlag || group?.sparksAdminPageFlag

   return (
      <Fragment>
         {hasAccessToSparks ? (
            <Fragment>
               <Sparks />
               <SparkPreviewDialog />
            </Fragment>
         ) : (
            <SparksPromotionalPage />
         )}
      </Fragment>
   )
}

const ConditionalCreateSparkButton = () => {
   const { group } = useGroup()
   const featureFlags = useFeatureFlags()

   const hasAccessToSparks =
      featureFlags?.sparksAdminPageFlag || group?.sparksAdminPageFlag

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
