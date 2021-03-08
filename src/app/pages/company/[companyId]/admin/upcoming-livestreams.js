import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import StreamsOverview from "../../../../components/views/group/admin/streams";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";
import {withFirebase} from "../../../../context/firebase";

const UpcomingLivestreamsPage = ({firebase}) => {

    return (
        <GroupDashboardLayout isCompany>
            <DashboardHead title="CareerFairy | Admin Upcoming Streams of"/>
            <StreamsOverview
                query={firebase.listenToUpcomingLiveStreamsByGroupId}
                typeOfStream="upcoming"
            />
        </GroupDashboardLayout>
    );
};


export default withFirebase(UpcomingLivestreamsPage);
