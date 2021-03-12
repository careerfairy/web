import React, {Fragment, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Box, CircularProgress, Container, Grid, Typography} from "@material-ui/core";
import usePagination from '@itsfaqih/usepagination';
import {Pagination} from "@material-ui/lab";
import StreamsToolbar from "./StreamsToolbar";
import {useSnackbar} from "notistack";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import NewStreamModal from "./NewStreamModal";
import {useRouter} from "next/router";
import {repositionElement} from "../../../../helperFunctions/HelperFunctions";
import GroupStreamCardV2Old from "../../../NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2Old";


const useStyles = makeStyles((theme) => ({
    root: {
        height: "inherit",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        display: "flex",
        flexDirection: "column"
    },
    streamCard: {},
    highlighted: {}
}));

const Index = ({group, typeOfStream, query, isAdmin}) => {
    const classes = useStyles();
    const {userData, authenticatedUser} = useAuth();
    const {enqueueSnackbar} = useSnackbar()
    const [upcomingStreams, setUpcomingStreams] = useState(null);
    const [filteredStreams, setFilteredStreams] = useState([]);
    const [openNewStreamModal, setOpenNewStreamModal] = useState(false);
    const {page, action} = usePagination(filteredStreams, 6);
    const [searchParams, setSearchParams] = useState('');
    const [fetching, setFetching] = useState(false);
    const [currentStream, setCurrentStream] = useState(null);
    const {query: {livestreamId}} = useRouter()

    useEffect(() => {
        if (group?.id) {
            setFetching(true)
            const unsubscribe = query(group.id,
                (querySnapshot) => {
                    const streamsData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                    if (livestreamId && typeOfStream === "draft") {
                        const currentIndex = streamsData.findIndex(
                            (el) => el.id === livestreamId
                        );
                        if (currentIndex > -1) {
                            if (isTargetDraft(streamsData[currentIndex])) {
                                repositionElement(streamsData, currentIndex, 0);
                            }
                        }
                    }
                    setUpcomingStreams(streamsData)
                    setFilteredStreams(streamsData)
                    setFetching(false)
                })
            return () => unsubscribe()
        }
    }, [livestreamId])

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

    const handleOpenNewStreamModal = () => {
        setOpenNewStreamModal(true)
    }

    const handleCloseNewStreamModal = () => {
        handleResetCurrentStream()
        setOpenNewStreamModal(false)
    }

    const handleResetCurrentStream = () => {
        setCurrentStream(null)
    }

    const handleEditStream = (streamObj) => {
        if (streamObj) {
            setCurrentStream(streamObj)
            handleOpenNewStreamModal()
        }
    }
    const isTargetDraft = (livestream) => isAdmin && (typeOfStream === "draft") && livestream.id === livestreamId


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
        // Reset back to page one on a new search
        action.goTo(1)
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
                <GroupStreamCardV2Old
                    mobile
                    isAdmin
                    id={livestream.id}
                    handleEditStream={handleEditStream}
                    isDraft={typeOfStream === "draft"}
                    hideActions
                    isTargetDraft={isTargetDraft(livestream)}
                    className={classes.streamCard}
                    user={authenticatedUser}
                    livestream={livestream}
                    isPastLivestream={typeOfStream === "past"}
                    groupData={group}
                    userData={userData}
                    livestreamId={livestreamId}
                />
            </Grid>
        );
    })

    return (
        <Fragment>
            <Container className={classes.root} maxWidth={false}>
                <StreamsToolbar
                    handleSubmit={handleSubmit}
                    onChange={onSearch}
                    group={group}
                    isAdmin={isAdmin}
                    openNewStreamModal={openNewStreamModal}
                    handleOpenNewStreamModal={handleOpenNewStreamModal}
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
            <NewStreamModal
                group={group}
                typeOfStream={typeOfStream}
                open={openNewStreamModal}
                handleResetCurrentStream={handleResetCurrentStream}
                currentStream={currentStream}
                onClose={handleCloseNewStreamModal}
            />
        </Fragment>
    );
};

const SearchMessage = ({message}) => (
    <Grid sm={12} md={12} lg={12} xl={12} item>
        <Typography variant="h4" align="center">
            {message}
        </Typography>
    </Grid>
)


export default Index;
