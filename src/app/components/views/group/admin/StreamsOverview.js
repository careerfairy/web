import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {
    Box,
    CircularProgress,
    Container,
    Grid,
} from "@material-ui/core";
import usePagination from '@itsfaqih/usepagination';
import {Pagination} from "@material-ui/lab";
import Typography from "@material-ui/core/Typography";
import GroupStreamCardV2 from "../../NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2";
import Toolbar from "./ToolBar";
import {useAuth} from "../../../../HOCs/AuthProvider";
import {useSnackbar} from "notistack";
import {snapShotsToData} from "../../../helperFunctions/HelperFunctions";


const useStyles = makeStyles((theme) => ({
    root: {
        height: "inherit",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        display: "flex",
        flexDirection: "column"
    }
}));

const StreamsOverview = ({group, typeOfStream, query}) => {
    const classes = useStyles();
    const {userData, authenticatedUser} = useAuth();
    const {enqueueSnackbar} = useSnackbar()
    const [upcomingStreams, setUpcomingStreams] = useState(null);
    const [filteredStreams, setFilteredStreams] = useState([]);
    const {page, action} = usePagination(filteredStreams, 6);
    const [searchParams, setSearchParams] = useState('');
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        (async function () {
            try {
                setFetching(true)
                const snapshots = await query(group.id)
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
        return Boolean(page.data.length === 0 && upcomingStreams?.length)
    }
    const noQueryHits = () => {
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
                || livestream.status?.message?.toLowerCase().indexOf(searchParams.toLowerCase()) >= 0
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
                    isDraft={typeOfStream === "draft"}
                    hideActions
                    user={authenticatedUser}
                    livestream={livestream}
                    isPastLivestream={typeOfStream === "past"}
                    groupData={group}
                    userData={userData}
                    livestreamId={livestream.id}
                />
            </Grid>
        );
    })

    return (
        <Container className={classes.root} maxWidth={false}>
            <Toolbar
                handleSubmit={handleSubmit}
                onChange={onSearch}
                group={group}
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
                        {noQueryHits() ?
                            <SearchMessage message={`You currently have no ${typeOfStream} Streams`}/>
                            :
                            noFilterHits() ?
                                <SearchMessage message={`You currently have no ${typeOfStream} Streams`}/>
                                :
                                livestreamElements}
                    </Grid>
                )}
            </Box>
            <Box flexGrow={1}/>
            <Box
                display="flex"
                justifyContent="center"
                py={3}
            >
                <Pagination
                    page={page.current}
                    disabled={!page.data.length}
                    count={page.last}
                    showFirstButton
                    showLastButton
                    onChange={onPageChange}
                    color="primary"
                    size="large"
                />
            </Box>
        </Container>
    );
};

const SearchMessage = ({message}) => (
    <Grid sm={12} md={12} lg={12} xl={12} item>
        <Typography variant="h4" align="center">
            {message}
        </Typography>
    </Grid>
)


export default StreamsOverview;
