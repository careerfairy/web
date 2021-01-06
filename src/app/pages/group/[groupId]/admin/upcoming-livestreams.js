import React, {useEffect, useMemo, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Head from "next/head";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
} from "@material-ui/core";
import usePagination from "firestore-pagination-hook";
import {snapShotsToData} from "../../../../components/helperFunctions/HelperFunctions";
import GroupStreamCardV2
    from "../../../../components/views/NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2";
import {useAuth} from "../../../../HOCs/AuthProvider";
import Page from "../../../../components/page";
import {useSnackbar} from "notistack";
import Toolbar from "../../../../components/views/group/admin/upcomingStreams/ToolBar";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        paddingTop: theme.spacing(2)
    },
    grid: {
        width: "100%",
        height: "100%"
    }
}));

const UpcomingLivestreamsPage = ({group, firebase}) => {
    const classes = useStyles();
    const {userData, authenticatedUser} = useAuth();
    const {enqueueSnackbar} = useSnackbar()
    const [upcomingStreams, setUpcomingStreams] = useState([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        (async function () {
            try {
                setFetching(true)
                const snapshots = await firebase.getUpcomingLiveStreamsByGroupId(group.id)
                const newStreams = snapShotsToData(snapshots)
                setUpcomingStreams(newStreams)
                setFetching(false)
            } catch (e) {
                console.log("-> e", e);
                setFetching(false)
                enqueueSnackbar("something went Wrong, please refresh the page", {
                    variant: "error",
                    preventDuplicate: true
                })
            }
        })()
    }, [])


    const livestreamElements = upcomingStreams.map((livestream) => {
        return (
            <Grid
                style={{height: 500}}
                key={livestream.id}
                xs={12}
                sm={6}
                md={4}
                lg={4}
                xl={4}
                item
            >
                <GroupStreamCardV2
                    mobile
                    isAdmin
                    hideActions
                    user={authenticatedUser}
                    livestream={livestream}
                    groupData={group}
                    userData={userData}
                    livestreamId={livestream.id}
                />
            </Grid>
        );
    })

    return (
        <Page title="CareerFairy | Admin Upcoming Streams">
            <Container className={classes.root} maxWidth={false}>
                <Toolbar/>
                <Box mt={3}>
                    {fetching ? (
                        <Box height="100%" alignItems="center" justifyContent="center" display="flex">
                            <CircularProgress color="primary"/>
                        </Box>
                    ) : (
                        <Grid
                            className={classes.grid}
                            container
                            spacing={3}
                        >
                            {livestreamElements}
                        </Grid>
                    )}
                </Box>
            </Container>
        </Page>
    );
};

UpcomingLivestreamsPage.layout = GroupDashboardLayout;

export default UpcomingLivestreamsPage;
