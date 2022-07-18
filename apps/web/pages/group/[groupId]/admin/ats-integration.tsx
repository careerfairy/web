import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration/AtsIntegrationContent"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"

const AtsIntegration = () => (
   <GroupDashboardLayout>
      <DashboardHead title="CareerFairy | ATS Integration" />
      <SuspenseWithBoundary>
         <AtsIntegrationContent />
      </SuspenseWithBoundary>
   </GroupDashboardLayout>
)

export default AtsIntegration
