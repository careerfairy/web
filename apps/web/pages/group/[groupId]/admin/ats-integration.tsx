import { ReactElement } from "react"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../components/util/Skeletons"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration"
import { withGroupDashboardLayout } from "../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const AtsIntegration = () => (
   <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
      <AtsIntegrationContent />
   </SuspenseWithBoundary>
)

AtsIntegration.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "ATS Integration",
      dashboardHeadTitle: "CareerFairy | ATS Integration",
   })(page)
}

export default AtsIntegration
