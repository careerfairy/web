import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import JoinGroup from "./index";
import Head from "next/head";
import {Container} from "@material-ui/core";

const useStyles = makeStyles(theme => ({}));

const UpcomingLivestreams = ({}) => {

    const classes = useStyles()

    return (
        <>
            <Head>
                <title key="title">CareerFairy | Admin Upcoming Streams</title>
            </Head>
            <Container maxWidth="lg">
                <div>hi</div>
            </Container>
        </>
    );
};

UpcomingLivestreams.layout = GroupDashboardLayout

export default UpcomingLivestreams;
