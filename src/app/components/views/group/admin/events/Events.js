import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {withFirebase} from 'context/firebase';
import {useRouter} from 'next/router';
import {AppBar, Box, Button, CircularProgress, Grid, Menu, MenuItem, Tab, Tabs} from "@material-ui/core";
import EnhancedGroupStreamCard from './enhanced-group-stream-card/EnhancedGroupStreamCard';
import {makeStyles} from "@material-ui/core/styles";
import useInfiniteScroll from "../../../../custom-hook/useInfiniteScroll";
import CustomInfiniteScroll from "../../../../util/CustomInfiteScroll";
import GroupStreamCardV2 from "../../../NextLivestreams/GroupStreams/groupStreamCard/GroupStreamCardV2";
import usePagination from "firestore-pagination-hook";
import useFirestoreLoadMore from "../../../../custom-hook/useFirestoreLoadMore";
import {snapShotsToData} from "../../../../helperFunctions/HelperFunctions";

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
    }
}))
const Events = (props) => {
    if (!props.group.id) {
        return null
    }
    const classes = useStyles()
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState(null);

    const [value, setValue] = React.useState(0);

    // const [
    //     val,
    //     {
    //         loaded,
    //         loadingMore,
    //         hasMore,
    //         loadMore,
    //     },
    //     error,
    //
    // ] = usePagination(
    //     props.firebase.queryPastLiveStreamsByGroupId(props.group.id),
    //     {
    //         limit: 6
    //     }
    // );

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
            limit: 6
        }
    );


    // const [itemsPast, loadMorePast, hasMorePast, totalItemsPast] = useInfiniteScroll(
    //     props.firebase.queryPastLiveStreamsByGroupId(props.group.id), 6, 3
    // );

    // const [itemsUpcoming, loadMoreUpcoming, hasMoreUpcoming, totalItemsUpcoming] = useInfiniteScroll(
    //     props.firebase.queryUpcomingLiveStreamsByGroupId(props.group.id), 6, 3
    // );
    //
    // const [itemsDrafts, loadMoreDrafts, hasMoreDrafts, totalItemsDrafts] = useInfiniteScroll(
    //     props.firebase.queryDraftLiveStreamsByGroupId(props.group.id), 6, 3
    // );

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function TabPanel(props) {
        const {children, value, index, ...other} = props;

        return (
            value === index &&
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

    // let livestreamElements = itemsUpcoming.map((livestream, index) => {
    //     return (
    //         <Grid style={{height: 620}} key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={4} item>
    //             <GroupStreamCardV2
    //                 mobile
    //                 isAdmin
    //                 hideActions
    //                 user={props.user}
    //                 livestream={livestream}
    //                 groupData={props.group}
    //                 userData={props.userData}
    //                 livestreamId={livestream.id}
    //             />
    //         </Grid>
    //     );
    // });
    //
    let pastLivestreamElements = snapShotsToData(itemsPast).map((livestream) => {
        return (
            <Grid style={{height: 620}} key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={4} item>
                <GroupStreamCardV2
                    mobile
                    isAdmin
                    hideActions
                    isPastLivestream
                    // key={livestream.id}
                    livestreamId={livestream.id}
                    livestream={livestream}
                    user={props.user}
                    userData={props.userData}
                    groupData={props.group}/>
            </Grid>
        );
    });
    //
    // let draftLivestreamElements = itemsDrafts.map((livestream, index) => {
    //     return (
    //         <Grid style={{height: 620}} key={livestream.id} xs={12} sm={6} md={4} lg={4} xl={4} item>
    //             <GroupStreamCardV2
    //                 mobile
    //                 isDraft
    //                 isAdmin
    //                 hideActions
    //                 isPastLivestream
    //                 key={livestream.id}
    //                 livestreamId={livestream.id}
    //                 livestream={livestream}
    //                 user={props.user}
    //                 userData={props.userData}
    //                 groupData={props.group}/>
    //         </Grid>
    //     );
    // });


    return (
        <div style={{width: '100%', textAlign: 'left', height: "100%"}}>
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
                {/*<Grid className={classes.grid} container spacing={2}>*/}
                {/*    {livestreamElements}*/}
                {/*</Grid>*/}
                {/*{hasMoreUpcoming && <Button fullWidth onClick={loadMoreUpcoming}>*/}
                {/*    Load More*/}
                {/*</Button>}*/}
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
                    variant="outlined" className={classes.loadMoreButton}
                    fullWidth
                    onClick={loadMorePast}
                >
                    {loadingMorePast ? "Loading" : "Load More"}
                </Button>}
            </TabPanel>
            <TabPanel value={value} index={2}>
                {/*<Grid className={classes.grid} container spacing={2}>*/}
                {/*    {draftLivestreamElements}*/}
                {/*</Grid>*/}
                {/*{hasMoreDrafts &&*/}
                {/*<Button variant="outlined" className={classes.loadMoreButton} fullWidth onClick={loadMoreDrafts}>*/}
                {/*    Load More*/}
                {/*</Button>}*/}
            </TabPanel>
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

export default withFirebase(Events);