import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamsOverview from "../../../../components/views/group/admin/streams";

const DraftStreamsPage = ({group, firebase, isAdmin}) => {

    return (
        <GroupDashboardLayout>
            <Page title={`CareerFairy | Admin Manage Drafts of ${group.universityName}`}>
                <StreamsOverview
                    query={firebase.listenToDraftLiveStreamsByGroupId}
                    group={group}
                    firebase={firebase}
                    isAdmin={isAdmin}
                    typeOfStream="draft"
                />
            </Page>
        </GroupDashboardLayout>
    );
};

export default DraftStreamsPage;
