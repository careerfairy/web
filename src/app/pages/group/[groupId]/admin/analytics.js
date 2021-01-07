import React from 'react';
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import Typography from "@material-ui/core/Typography";

const AnalyticsPage = ({group, firebase}) => {

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
        <Typography variant="h4">
            Analytics
        </Typography>
        </Page>
    );
};
AnalyticsPage.layout = GroupDashboardLayout

export default AnalyticsPage;
