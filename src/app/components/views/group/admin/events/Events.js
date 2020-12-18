import React, {useContext, useEffect, useMemo, useState} from 'react';
import {withFirebase} from 'context/firebase';
import {useRouter} from 'next/router';
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Grid,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    useTheme,
    Zoom
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import GroupStreamCardV2 from "../../../NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2";
import usePagination from "firestore-pagination-hook";
import {copyStringToClipboard, snapShotsToData} from "../../../../helperFunctions/HelperFunctions";
import AddIcon from "@material-ui/icons/Add";
import clsx from "clsx";
import Fab from "@material-ui/core/Fab";
import UserContext from "../../../../../context/user/UserContext";
import {CustomSplitButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import {useSnackbar} from "notistack";

const useStyles = makeStyles(theme => ({
    streamsWrapper: {
        overflowY: "hidden !important"
    },
    grid: {
        margin: 0,
        marginTop: 8,
        width: "100%"
    },
    loadMoreButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(8),
        right: theme.spacing(2),
        zIndex: 1,
        fontWeight: 600
    },
    buttonGroup: {
        borderRadius: theme.spacing(3),
        padding: theme.spacing(1),
        background: theme.palette.primary.main,
        position: 'fixed',
        bottom: theme.spacing(8),
        right: theme.spacing(2),
        zIndex: 1,
        fontWeight: 600,
    },
    mainButton: {
        borderRadius: theme.spacing(3, 0, 0, 3),
    },
    sideButton: {
        borderRadius: theme.spacing(0, 3, 3, 0),
    },
}))

const Events = (props) => {
    if (!props.group.id) {
        return null
    }
    const classes = useStyles()
    const router = useRouter();
    const {
        query: {eventTab}
    } = router
    const theme = useTheme();
    const {enqueueSnackbar} = useSnackbar()

    const {authenticatedUser, userData} = useContext(UserContext);

    const [anchorEl, setAnchorEl] = useState(null);

    const [value, setValue] = React.useState(0);

    useEffect(() => {
        if (eventTab) {
            setValue(Number(eventTab))
        }
    }, [router, eventTab])

    const {
        loading: loadingPast,
        loadingError,
        loadingMore: loadingMorePast,
        loadingMoreError,
        hasMore: hasMorePast,
        items: itemsPast,
        loadMore: loadMorePast
    } = usePagination(
        props.firebase.queryPastLiveStreamsByGroupId(props.group.id),
        {
            limit: 12
        }
    );

    const {
        loading: loadingUpcoming,
        loadingError: loadingErrorUpcoming,
        loadingMore: loadingMoreUpcoming,
        loadingMoreError: loadingMoreErrorUpcoming,
        hasMore: hasMoreUpcoming,
        items: itemsUpcoming,
        loadMore: loadMoreUpcoming
    } = usePagination(
        props.firebase.queryUpcomingLiveStreamsByGroupId(props.group.id),
        {
            limit: 12
        }
    );
    const {
        loading: loadingDrafts,
        loadingError: loadingErrorDrafts,
        loadingMore: loadingMoreDrafts,
        loadingMoreError: loadingMoreErrorDrafts,
        hasMore: hasMoreDrafts,
        items: itemsDrafts,
        loadMore: loadMoreDrafts,
    } = usePagination(
        props.firebase.queryDraftLiveStreamsByGroupId(props.group.id),
        {
            limit: 12
        }
    );

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const switchToNextLivestreamsTab = () => {
        setValue(0)
    }

    function TabPanel(props) {
        const {children, value, index, ...other} = props;

        return (
            (value === index) &&
            <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
                {children}
            </div>
        );
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const handleClickDraftNewStream = async () => {
        const groupId = props.group.id
        const targetPath = `/draft-stream`
        return await router.push({
            pathname: targetPath,
            query: {
                absolutePath: router.asPath,
                careerCenterIds: groupId
            }
        })
    }

    const handleCLickCreateNewLivestream = async () => {
        if (userData.isAdmin) {
            const targetPath = `/new-livestream`
            await router.push({
                pathname: targetPath,
            })
        }
    }


    const shouldRenderFab = () => {
        if (!userData?.isAdmin) {
            return false
        } else {
            return Boolean(value === 0 || value === 1)
        }
    }

    const handleShareDraftLink = () => {
        let baseUrl = "https://careerfairy.io"
        if (window?.location?.origin) {
            baseUrl = window.location.origin
        }
        const groupId = props.group.id
        const targetPath = `${baseUrl}/draft-stream?careerCenterIds=${groupId}`
        copyStringToClipboard(targetPath)
        enqueueSnackbar("Link has been copied to your clipboard", {
            variant: "default",
            preventDuplicate: true
        })
    }

    const draftButtonOptions = [{
        label: 'Create a new draft',
        onClick: () => handleClickDraftNewStream()
    }, {
        label: 'Generate a sharable draft link',
        onClick: () => handleShareDraftLink()
    }];


    let livestreamElements = useMemo(() => snapShotsToData(itemsUpcoming).map((livestream) => {
        return (
            <Grid style={{height: 620}} key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={4} item>
                <GroupStreamCardV2
                    mobile
                    isAdmin
                    hideActions
                    user={props.user}
                    livestream={livestream}
                    groupData={props.group}
                    userData={props.userData}
                    livestreamId={livestream.id}
                />
            </Grid>
        );
    }), [loadMoreUpcoming]);

    let pastLivestreamElements = useMemo(() => snapShotsToData(itemsPast).map((livestream) => {
        return (
            <Grid style={{height: 620}} key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={4} item>
                <GroupStreamCardV2
                    mobile
                    isAdmin
                    hideActions
                    isPastLivestream
                    key={livestream.id}
                    livestreamId={livestream.id}
                    livestream={livestream}
                    user={props.user}
                    userData={props.userData}
                    groupData={props.group}/>
            </Grid>
        );
    }), [loadMorePast]);

    let draftLivestreamElements = useMemo(() => snapShotsToData(itemsDrafts).map((livestream) => {
        return (
            <Grid style={{height: 620}} key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={4} item>
                <GroupStreamCardV2
                    mobile
                    isDraft
                    isAdmin
                    hideActions
                    isPastLivestream
                    key={livestream.id}
                    livestreamId={livestream.id}
                    livestream={livestream}
                    user={props.user}
                    switchToNextLivestreamsTab={switchToNextLivestreamsTab}
                    userData={props.userData}
                    groupData={props.group}/>
            </Grid>
        );
    }), [loadMoreDrafts]);


    return (
        <div style={{width: '100%', textAlign: 'left', height: "100%", position: "relative"}}>
            <AppBar color='default' position="sticky">
                <Tabs
                    variant="fullWidth"
                    value={value}
                    onChange={handleChange}
                    indicatorColor='primary'
                    aria-label="nav tabs example"
                >
                    <Tab label="Next Live streams" {...a11yProps(0)}/>
                    <Tab label="Past Live streams" {...a11yProps(1)}/>
                    <Tab label="Draft Live streams" {...a11yProps(2)}/>
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                {loadingMoreUpcoming ?
                    <Box justifyContent="center" display="flex">
                        <CircularProgress color="primary"/>
                    </Box>
                    :
                    <Grid className={classes.grid} container spacing={2}>
                        {livestreamElements}
                    </Grid>}
                {hasMoreUpcoming &&
                <Button
                    fullWidth
                    disabled={loadingMorePast}
                    variant="outlined"
                    className={classes.loadMoreButton}
                    startIcon={loadingMoreUpcoming && <CircularProgress color="inherit" size={20}/>}
                    onClick={loadMoreUpcoming}
                >
                    {loadingMoreUpcoming ? "Loading" : "Load More"}
                </Button>}
            </TabPanel>
            <TabPanel value={value} index={1}>
                {loadingPast ?
                    <Box justifyContent="center" display="flex">
                        <CircularProgress color="primary"/>
                    </Box>
                    :
                    <Grid className={classes.grid} container spacing={2}>
                        {pastLivestreamElements}
                    </Grid>}
                {hasMorePast &&
                <Button
                    disabled={loadingMorePast}
                    startIcon={loadingMorePast && <CircularProgress color="inherit" size={20}/>}
                    variant="outlined"
                    className={classes.loadMoreButton}
                    fullWidth
                    onClick={loadMorePast}
                >
                    {loadingMorePast ? "Loading" : "Load More"}
                </Button>}
            </TabPanel>
            <TabPanel value={value} index={2}>
                {loadingDrafts ?
                    <Box justifyContent="center" display="flex">
                        <CircularProgress color="primary"/>
                    </Box>
                    :
                    <Grid className={classes.grid} container spacing={2}>
                        {draftLivestreamElements}
                    </Grid>}
                {hasMoreDrafts &&
                <Button
                    disabled={loadingMoreDrafts}
                    startIcon={loadingMoreDrafts && <CircularProgress color="inherit" size={20}/>}
                    variant="outlined"
                    className={classes.loadMoreButton}
                    fullWidth
                    onClick={loadMoreDrafts}
                >
                    {loadingMoreDrafts ? "Loading" : "Load More"}
                </Button>}

            </TabPanel>
            <CustomZoom
                zoomIn={shouldRenderFab()}
            >
                <Fab
                    onClick={handleCLickCreateNewLivestream}
                    variant="extended"
                    aria-label={'Create a new Stream'}
                    className={classes.fab}
                    color="primary">
                    <AddIcon/>
                    Create a new Stream
                </Fab>
            </CustomZoom>
            <CustomZoom
                zoomIn={value === 2}
            >
                <CustomSplitButton
                    mainButtonProps={{classes: {root: classes.mainButton}, disableElevation: true}}
                    sideButtonProps={{classes: {root: classes.sideButton}, disableElevation: true}}
                    className={classes.buttonGroup}
                    size="large"
                    options={draftButtonOptions}
                />
            </CustomZoom>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => router.push('/group/' + props.group.id + '/admin/schedule-event')}>Send a
                    Company Request</MenuItem>
                <MenuItem onClick={handleClose}>Schedule a Live Stream</MenuItem>
            </Menu>
        </div>
    )
        ;
}

const CustomZoom = ({children, zoomIn, shouldRenderFab, ...props}) => {
    const theme = useTheme()
    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    return (
        <Zoom
            {...props}
            timeout={transitionDuration}
            in={zoomIn}
            unmountOnExit
            style={{
                transitionDelay: `${zoomIn ? transitionDuration.exit : 0}ms`,
            }}
        >
            {children}
        </Zoom>
    )
}

export default withFirebase(Events);