import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import EditOverview from "../../../../components/views/group/admin/edit";



const EditGroupProfile = ({group, firebase}) => {
    return (
        <Page title="CareerFairy | Edit Group Details">
            <EditOverview
                firebase={firebase}
                group={group}
            />
        </Page>
    );
};
EditGroupProfile.layout = GroupDashboardLayout

export default EditGroupProfile;
