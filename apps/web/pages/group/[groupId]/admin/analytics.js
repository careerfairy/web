import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import AnalyticsOverview from "../../../../components/views/group/admin/analytics"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import { GroupAnalyticsProvider } from "../../../../HOCs/GroupAnalyticsProvider"

const AnalyticsPage = () => {
   return (
      <GroupDashboardLayout>
         <DashboardHead title="CareerFairy | Admin Analytics of" />
         <GroupAnalyticsProvider>
            <AnalyticsOverview />
         </GroupAnalyticsProvider>
      </GroupDashboardLayout>
   )
}

export default AnalyticsPage
