import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration/AtsIntegrationContent"

const AtsIntegration = () => (
   <GroupDashboardLayout>
      <DashboardHead title="CareerFairy | ATS Integration" />
      <AtsIntegrationContent />
   </GroupDashboardLayout>
)

export default AtsIntegration
