import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamResults from "../../../../components/views/group/admin/StreamResults";

const UpcomingLivestreamsPage = ({group, firebase}) => {

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
            <StreamResults
                query={firebase.getUpcomingLiveStreamsByGroupId}
                group={group}
                firebase={firebase}
                typeOfStreams="upcoming"
            />
        </Page>
    );
};

UpcomingLivestreamsPage.layout = GroupDashboardLayout;

export default UpcomingLivestreamsPage;
