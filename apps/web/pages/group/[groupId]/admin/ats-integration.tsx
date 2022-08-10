import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../components/util/Skeletons"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration"

const AtsIntegration = () => (
   <GroupDashboardLayout>
      <DashboardHead title="CareerFairy | ATS Integration" />
      <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
         <AtsIntegrationContent />
      </SuspenseWithBoundary>
   </GroupDashboardLayout>
)

export default AtsIntegration
