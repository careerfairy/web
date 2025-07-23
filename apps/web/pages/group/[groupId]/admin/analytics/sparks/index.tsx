import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import { SparksAnalyticsProvider } from "components/views/admin/sparks/analytics/SparksAnalyticsContext"
import { SparksPromotionalPage } from "components/views/admin/sparks/components/promotional-page/SparksPromotionalPage"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { AdminContainer } from "components/views/group/admin/common/Container"
import { useGroup } from "layouts/GroupDashboardLayout"
import { ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const AdminSparksAnalyticsPage = () => {
   const hasAccessToSparks = useHasAccessToSparks()
   const { group } = useGroup()

   if (!group) return null
   if (!hasAccessToSparks) return <SparksPromotionalPage />

   return (
      <AdminContainer>
         <SparksAnalyticsProvider>
            <GroupSparkAnalytics />
         </SparksAnalyticsProvider>
      </AdminContainer>
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
