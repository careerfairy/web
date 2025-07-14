import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import { SparksAnalyticsProvider } from "components/views/admin/sparks/analytics/SparksAnalyticsContext"
import { SparksPromotionalPage } from "components/views/admin/sparks/components/promotional-page/SparksPromotionalPage"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment, ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

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
      </Fragment>
   )
}

AdminSparksAnalyticsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      dashboardHeadTitle: "CareerFairy | My Sparks Analytics",
      subNavigationFor: "analytics",
   })(page)
}

export default AdminSparksAnalyticsPage
