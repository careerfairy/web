import React from 'react';
import StreamsOverview from "../../../../components/views/group/admin/streams"
import {withFirebase} from "../../../../context/firebase";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";

const PastLivestreamsPage = ({firebase}) => {

    return (
        <GroupDashboardLayout isCompany>
            <DashboardHead title="CareerFairy | Admin Past Streams of"/>
            <StreamsOverview
                query={firebase.listenToPastLiveStreamsByGroupId}
                typeOfStream="past"
            />
        </GroupDashboardLayout>
    );
};

export default withFirebase(PastLivestreamsPage);
