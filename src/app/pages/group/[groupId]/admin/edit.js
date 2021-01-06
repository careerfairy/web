import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Head from "next/head";
import {Container} from "@material-ui/core";

const useStyles = makeStyles(theme => ({}));

const EditGroupProfile = ({}) => {

    const classes = useStyles()

    return (
        <>
            <Head>
                <title key="title">CareerFairy | Edit Group</title>
            </Head>
            <Container maxWidth="lg">
                <div>hi</div>
            </Container>
        </>
    );
};

EditGroupProfile.layout = GroupDashboardLayout

export default EditGroupProfile;
