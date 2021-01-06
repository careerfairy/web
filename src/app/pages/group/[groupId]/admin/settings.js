import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Head from "next/head";
import {Container} from "@material-ui/core";

const useStyles = makeStyles(theme => ({}));

const GroupSettings = ({}) => {

    const classes = useStyles()

    return (
        <>
            <Head>
                <title key="title">CareerFairy | Group Settings</title>
            </Head>
            <Container maxWidth="lg">
                <div>hi</div>
            </Container>
        </>
    );
};

GroupSettings.layout = GroupDashboardLayout

export default GroupSettings;
