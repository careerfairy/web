import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamResults from "../../../../components/views/group/admin/StreamResults";

const PastLivestreams = ({group, firebase}) => {

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
            <StreamResults
                query={firebase.getPastLiveStreamsByGroupId}
                group={group}
                firebase={firebase}
                typeOfStreams="upcoming"
            />
        </Page>
    );
};
PastLivestreams.layout = GroupDashboardLayout

export default PastLivestreams;
