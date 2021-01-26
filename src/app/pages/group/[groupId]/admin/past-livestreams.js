import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import StreamsOverview from "../../../../components/views/group/admin/StreamsOverview";

const PastLivestreamsPage = ({group, firebase}) => {

    return (
        <Page title={`CareerFairy | Admin Past Streams of ${group.universityName}`}>
            <StreamsOverview
                query={firebase.listenToPastLiveStreamsByGroupId}
                group={group}
                firebase={firebase}
                typeOfStream="past"
            />
        </Page>
    );
};
PastLivestreamsPage.layout = GroupDashboardLayout

export default PastLivestreamsPage;
