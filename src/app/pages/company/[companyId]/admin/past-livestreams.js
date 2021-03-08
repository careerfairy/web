import React from 'react';
import DashboardHead from "../../../../layouts/CompanyDashboardLayout/DashboardHead";
import StreamsOverview from "../../../../components/views/group/admin/streams"
import {withFirebase} from "../../../../context/firebase";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";

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
