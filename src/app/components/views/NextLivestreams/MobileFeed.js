import React, {useEffect, useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';

import { Button, Grid, Typography, AppBar, Tabs, Tab, Box } from "@material-ui/core";
import {withFirebase} from "../../../context/firebase";
import GroupCategories from "./GroupCategories/GroupCategories";
import GroupStreams from "./GroupStreams/GroupStreams";
import {useRouter} from "next/router";
import GroupJoinModal from "../profile/GroupJoinModal";
import {bindKeyboard} from 'react-swipeable-views-utils';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);


const useStyles = makeStyles((theme) => ({
    streamsGrid: {
        // marginBottom: theme.spacing(1)
        height: "100%"
    },
    bar: {
        boxShadow: "none",
        position: "sticky",
        top: 0,
        zIndex: 1
    },
    panel: {
        minHeight: 300
    },
    followButton: {
        marginTop: 5,
        position: "sticky",
        top: 165,
        zIndex: 20
    },
    tabPanel: {

    }
}));

function TabPanel({children, value, index, ...other}) {
    const classes = useStyles()
    return (
        <Box className={classes.tabPanel} p={1} {...other}>
            {children}
        </Box>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}


const MobileFeed = ({
                        handleToggleActive,
                        hasCategories,
                        groupData,
                        userData,
                        alreadyJoined,
                        user,
                        livestreams,
                        searching,
                        scrollToTop,
                        livestreamId,
                        careerCenterId,
                        listenToUpcoming,
                        selectedOptions
                    }) => {
    const classes = useStyles();
    const theme = useTheme();
    const router = useRouter()
    const absolutePath = router.asPath
    const [value, setValue] = useState(0);
    const [openJoinModal, setOpenJoinModal] = useState(false);

    useEffect(() => {
        if (groupData) {
            handleResetView()
        }
    }, [groupData.universityName])

    useEffect(() => {
        scrollToTop()
    }, [value])


    const handleChange = (event, newValue) => {
        setValue(newValue);
    }

    const handleResetView = () => {
        setValue(0)
    }

    const handleChangeIndex = (index) => {
        if (index === 0 || index === 1) {
            setValue(index);
        }
    };

    const handleCloseJoinModal = () => {
        setOpenJoinModal(false);
    };
    const handleOpenJoinModal = () => {
        setOpenJoinModal(true);
    };

    const handleJoin = () => {
        if (userData) {
            handleOpenJoinModal()
        } else {
            return router.push({pathname: "/login", query: {absolutePath}})
        }
    }


    return (
        <>
            <AppBar className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    variant="fullWidth"
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab wrapped value={0}  {...a11yProps(0)} fullWidth
                         label={<Typography variant="h5">Events</Typography>}/>
                    {hasCategories ?
                        <Tab value={1} wrapped fullWidth disabled={!groupData.categories}
                             {...a11yProps(1)}
                             label={<Typography variant="h5">Filter</Typography>}/>
                        :
                        null}
                </Tabs>
            </AppBar>
            {!userData?.groupIds?.includes(groupData.groupId) && !listenToUpcoming &&
            <>
                <Button className={classes.followButton} onClick={handleJoin} size="large" variant="contained" fullWidth
                        color="primary" align="center">
                    <Typography variant="h5">Start Following {groupData.universityName}</Typography>
                </Button>
                <GroupJoinModal
                    open={openJoinModal}
                    group={groupData}
                    alreadyJoined={alreadyJoined}
                    userData={userData}
                    closeModal={handleCloseJoinModal}
                />
            </>
            }
            <BindKeyboardSwipeableViews
                style={{overflow: "hidden", flex: 1}}
                disabled={!Boolean(groupData.categories)}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                slideStyle={{overflow: "hidden", height: "max-content"}}
                onChangeIndex={handleChangeIndex}>
                <TabPanel dir={theme.direction}>
                    <Grid className={classes.streamsGrid} container spacing={2}>
                        <GroupStreams user={user}
                                      mobile={true}
                                      hasCategories={hasCategories}
                                      livestreamId={livestreamId}
                                      listenToUpcoming={listenToUpcoming}
                                      careerCenterId={careerCenterId}
                                      selectedOptions={selectedOptions}
                                      searching={searching}
                                      alreadyJoined={alreadyJoined}
                                      livestreams={livestreams}
                                      userData={userData}
                                      groupData={groupData}/>
                    </Grid>
                </TabPanel>
                <TabPanel dir={theme.direction}>
                    <Grid className={classes.streamsGrid} container spacing={2}>
                        <GroupCategories alreadyJoined={alreadyJoined}
                                         groupData={groupData}
                                         user={user}
                                         hasCategories={hasCategories}
                                         livestreams={livestreams}
                                         userData={userData}
                                         handleToggleActive={handleToggleActive}
                                         mobile={true}/>
                    </Grid>
                </TabPanel>
            </BindKeyboardSwipeableViews>
        </>
    );
}

export default withFirebase(MobileFeed)
