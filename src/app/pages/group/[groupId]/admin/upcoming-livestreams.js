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
import usePagination from '@itsfaqih/usepagination';
import {snapShotsToData} from "../../../../components/helperFunctions/HelperFunctions";
import GroupStreamCardV2
    from "../../../../components/views/NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2";
import {useAuth} from "../../../../HOCs/AuthProvider";
import Page from "../../../../components/page";
import {useSnackbar} from "notistack";
import Toolbar from "../../../../components/views/group/admin/upcomingStreams/ToolBar";
import {Pagination} from "@material-ui/lab";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "inherit",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        display: "flex",
        flexDirection: "column"
    }
}));

const UpcomingLivestreamsPage = ({group, firebase}) => {
    const classes = useStyles();
    const {userData, authenticatedUser} = useAuth();
    const {enqueueSnackbar} = useSnackbar()
    const [upcomingStreams, setUpcomingStreams] = useState(null);
    const [filteredStreams, setFilteredStreams] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [searchParams, setSearchParams] = useState('');
    const {page, action} = usePagination(filteredStreams || [], 6);


    useEffect(() => {
        (async function () {
            try {
                setFetching(true)
                const snapshots = await firebase.getUpcomingLiveStreamsByGroupId(group.id)
                const newStreams = snapShotsToData(snapshots)
                setUpcomingStreams(newStreams)
                setFilteredStreams(newStreams)
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


    const onPageChange = (event, number) => {
        action.goTo(number)
    }

    const onSearch = (event) => {
        const value = event.currentTarget.value
        setSearchParams(value)
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        handleFilter()
        setSearchParams('')
    }

    const noFilterHits = () => {
        return Boolean(filteredStreams?.length === 0)
    }
    const noGroupHasNoUpcoming = () => {
        return Boolean(upcomingStreams?.length === 0)
    }

    const handleRefreshSearch = () => {
        setSearchParams('')
        handleFilter()
    }

    const handleFilter = () => {
        const newFilteredStreams = upcomingStreams?.filter(livestream => {
            return (
                livestream.title.toLowerCase().indexOf(searchParams.toLowerCase()) >= 0
                || livestream.company.toLowerCase().indexOf(searchParams.toLowerCase()) >= 0
                || livestream.summary.toLowerCase().indexOf(searchParams.toLowerCase()) >= 0
                // Checks speakers
                || livestream.speakers.some(speaker =>
                    speaker.firstName.toLowerCase().indexOf(searchParams.toLowerCase()) >= 0
                    || speaker.lastName.toLowerCase().indexOf(searchParams.toLowerCase()) >= 0)
            )
        })
        setFilteredStreams(newFilteredStreams)
    }


    const livestreamElements = page.data.map((livestream) => {
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
                <Toolbar
                    handleSubmit={handleSubmit}
                    onChange={onSearch}
                    value={searchParams}
                    handleRefresh={handleRefreshSearch}
                />
                <Box mt={3}>
                    {fetching ? (
                        <Box height="100%" alignItems="center" justifyContent="center" display="flex">
                            <CircularProgress color="primary"/>
                        </Box>
                    ) : (
                        <Grid
                            container
                            spacing={3}
                        >
                            {noGroupHasNoUpcoming() ?
                                <Grid sm={12} md={12} lg={12} xl={12} item>
                                    <Typography variant="h4" align="center">
                                        You currently have no scheduled Streams
                                    </Typography>
                                </Grid>
                                :
                                noFilterHits() ?
                                    <Grid sm={12} md={12} lg={12} xl={12} item>
                                        <Typography variant="h4" align="center">
                                            Could not find any matches
                                        </Typography>
                                    </Grid>
                                    :
                                    livestreamElements}
                        </Grid>
                    )}
                </Box>
                <Box
                    mt={3}
                    display="flex"
                    justifyContent="center"
                    marginTop="auto"
                >
                    <Pagination
                        page={page.current}
                        disabled={!page.data.length}
                        count={page.numbers.length}
                        showFirstButton={page.next}
                        showLastButton={page.previous}
                        onChange={onPageChange}
                        color="primary"
                        size="large"
                    />
                </Box>
            </Container>
        </Page>
    );
};

UpcomingLivestreamsPage.layout = GroupDashboardLayout;

export default UpcomingLivestreamsPage;
