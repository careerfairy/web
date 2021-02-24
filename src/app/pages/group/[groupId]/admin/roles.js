import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import RolesOverview from "../../../../components/views/group/admin/roles";


const RolesPage = ({group, firebase}) => {
    return (
        <Page title={`CareerFairy | Member Roles of ${group.universityName}`}>
            <RolesOverview
                group={group}
                firebase={firebase}
            />
        </Page>
    );
};
RolesPage.layout = GroupDashboardLayout

export default RolesPage;
