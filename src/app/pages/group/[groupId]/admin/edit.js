import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import EditOverview from "../../../../components/views/group/admin/edit";



const EditGroupProfile = ({group, firebase}) => {
    return (
        <GroupDashboardLayout>
        <Page title={`CareerFairy | Admin Edit Details of ${group.universityName}`}>
            <EditOverview
                firebase={firebase}
                group={group}
            />
        </Page>
        </GroupDashboardLayout>
    );
};

export default EditGroupProfile;
