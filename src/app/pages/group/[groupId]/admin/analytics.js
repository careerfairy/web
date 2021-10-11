import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import AnalyticsOverview from "../../../../components/views/group/admin/analytics";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";

const AnalyticsPage = () => {
   return (
      <GroupDashboardLayout>
         <DashboardHead title="CareerFairy | Admin Analytics of" />
         <AnalyticsOverview />
      </GroupDashboardLayout>
   );
};

export default AnalyticsPage;
