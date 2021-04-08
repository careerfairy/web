import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import LivestreamAnalyticsLayout from "../../layouts/LivestreamAnalyticsLayout";

const useStyles = makeStyles(theme => ({}));

const LivestreamAnalyticsPage = ({}) => {

    const classes = useStyles()

    return (
        <LivestreamAnalyticsLayout>
            <h1>
                Hi
            </h1>
        </LivestreamAnalyticsLayout>
    );
};

export default LivestreamAnalyticsPage;
