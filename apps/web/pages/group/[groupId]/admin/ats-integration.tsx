import React, { Suspense } from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration/AtsIntegrationContent"
import ErrorBoundary from "../../../../components/ErrorBoundary"

const AtsIntegration = () => (
   <GroupDashboardLayout>
      <DashboardHead title="CareerFairy | ATS Integration" />
      <ErrorBoundary>
         <AtsIntegrationContent />
      </ErrorBoundary>
   </GroupDashboardLayout>
)

export default AtsIntegration
