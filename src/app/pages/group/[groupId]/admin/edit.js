import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import EditOverview from "../../../../components/views/group/admin/edit";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";

const EditGroupProfile = () => {
    return (
        <GroupDashboardLayout>
            <DashboardHead title="CareerFairy | Admin Edit Details of"/>
            <EditOverview/>
        </GroupDashboardLayout>
    );
};

export default EditGroupProfile;
