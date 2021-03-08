import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import RolesOverview from "../../../../components/views/group/admin/roles";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";


const RolesPage = () => {
    return (
        <GroupDashboardLayout isCompany>
            <DashboardHead title="CareerFairy | Member Roles of"/>
            <RolesOverview/>
        </GroupDashboardLayout>
    );
};

export default RolesPage;
