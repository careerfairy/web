import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import AnalyticsOverview from "../../../../components/views/group/admin/analytics/index-old"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import { GroupAnalyticsProvider } from "../../../../HOCs/GroupAnalyticsProvider"

const AnalyticsPage = ({ groupId }) => {
   return (
      <GroupDashboardLayout pageDisplayName={"Analytics"} groupId={groupId}>
         <DashboardHead title="CareerFairy | Admin Analytics of" />
         <GroupAnalyticsProvider>
            <AnalyticsOverview />
         </GroupAnalyticsProvider>
      </GroupDashboardLayout>
   )
}

export async function getServerSideProps(context) {
   const { groupId } = context.params
   return {
      props: {
         groupId,
      },
   }
}

export default AnalyticsPage
