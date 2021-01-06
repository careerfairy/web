import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamsOverview from "../../../../components/views/group/admin/StreamsOverview";

const DraftStreamsPage = ({group, firebase}) => {

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
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
