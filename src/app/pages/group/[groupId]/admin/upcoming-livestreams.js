import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamsOverview from "../../../../components/views/group/admin/StreamsOverview";

const UpcomingLivestreamsPage = ({group, firebase}) => {

    return (
        <Page title={`CareerFairy | Admin Upcoming Streams of ${group.universityName}`}>
            <StreamsOverview
                query={firebase.getUpcomingLiveStreamsByGroupId}
                group={group}
                firebase={firebase}
                typeOfStream="upcoming"
            />
        </Page>
    );
};

UpcomingLivestreamsPage.layout = GroupDashboardLayout;

export default UpcomingLivestreamsPage;
