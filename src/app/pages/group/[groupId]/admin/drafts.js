import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamsOverview from "../../../../components/views/group/admin/StreamsOverview";

const DraftStreamsPage = ({group, firebase}) => {

    return (
        <Page title={`CareerFairy | Admin Manage Drafts of ${group.universityName}`}>
            <StreamsOverview
                query={firebase.getDraftLiveStreamsByGroupId}
                group={group}
                firebase={firebase}
                typeOfStream="draft"
            />
        </Page>
    );
};
DraftStreamsPage.layout = GroupDashboardLayout

export default DraftStreamsPage;
