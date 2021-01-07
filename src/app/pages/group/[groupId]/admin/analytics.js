import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import AnalyticsOverview from "../../../../components/views/group/admin/analytics";

const AnalyticsPage = ({group, firebase}) => {

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
            <AnalyticsOverview
                group={group}
                firebase={firebase}
            />
        </Page>
    );
};
AnalyticsPage.layout = GroupDashboardLayout

export default AnalyticsPage;
