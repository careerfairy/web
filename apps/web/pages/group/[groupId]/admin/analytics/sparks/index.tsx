import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import { SparksAnalyticsProvider } from "components/views/admin/sparks/analytics/SparksAnalyticsContext"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import { SparksPromotionalPage } from "components/views/admin/sparks/components/promotional-page/SparksPromotionalPage"
import SparksDialog from "components/views/admin/sparks/sparks-dialog/SparksDialog"
import SparksOnboardingDialog from "components/views/admin/sparks/sparks-onboarding-dialog/SparksOnboardingDialog"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment, ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const ConditionalCreateSparkButtonWrapper = () => {
   const hasAccessToSparks = useHasAccessToSparks()

   return hasAccessToSparks ? (
      <Fragment>
         <CreateSparkButton />
         <SparksDialog />
      </Fragment>
   ) : null
}

const AdminSparksAnalyticsPage = () => {
   const hasAccessToSparks = useHasAccessToSparks()
   const { group } = useGroup()

   if (!group) return null
   if (!hasAccessToSparks) return <SparksPromotionalPage />

   return (
      <Fragment>
         <SparksAnalyticsProvider>
            <GroupSparkAnalytics />
         </SparksAnalyticsProvider>
         <SparksOnboardingDialog />
      </Fragment>
   )
}

AdminSparksAnalyticsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      topBarCta: <ConditionalCreateSparkButtonWrapper />,
      dashboardHeadTitle: "CareerFairy | My Sparks Analytics",
      subNavigationFor: "analytics",
   })(page)
}

export default AdminSparksAnalyticsPage
