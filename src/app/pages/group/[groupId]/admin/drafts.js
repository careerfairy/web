import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import JoinGroup from "./index";
import Head from "next/head";
import {Container} from "@material-ui/core";

const useStyles = makeStyles(theme => ({}));

const Drafts = ({}) => {

    const classes = useStyles()

    return (
        <>
            <Head>
                <title key="title">CareerFairy | Admin Drafts</title>
            </Head>
            <Container maxWidth="lg">
                <div>hi</div>
            </Container>
        </>
    );
};

Drafts.layout = GroupDashboardLayout

export default Drafts;
