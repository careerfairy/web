import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamsOverview from "../../../../components/views/group/admin/StreamsOverview";

const PastLivestreamsPage = ({group, firebase}) => {

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
            <StreamsOverview
                query={firebase.getPastLiveStreamsByGroupId}
                group={group}
                firebase={firebase}
                typeOfStream="upcoming"
            />
        </Page>
    );
};
PastLivestreamsPage.layout = GroupDashboardLayout

export default PastLivestreamsPage;
