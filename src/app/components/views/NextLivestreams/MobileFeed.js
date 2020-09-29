import React, {useEffect, useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {Button, Typography,} from "@material-ui/core";
import {withFirebase} from "../../../context/firebase";
import GroupCategories from "./GroupCategories/GroupCategories";
import GroupStreams from "./GroupStreams/GroupStreams";
import {useRouter} from "next/router";
import GroupJoinModal from "../profile/GroupJoinModal";


function TabPanel({children, value, index, ...other}) {

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={2}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({

    bar: {
        boxShadow: "none",
        position: "sticky",
        top: 100,
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
    }
}));


const MobileFeed = ({handleToggleActive, groupData, userData, alreadyJoined, user, livestreams, searching, scrollToTop, livestreamId, careerCenterId, listenToUpcoming, selectedOptions}) => {
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
                    {groupData.categories ?
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
            <SwipeableViews
                disabled={!Boolean(groupData.categories)}
                style={{minHeight: 200}}
                containerStyle={{WebkitOverflowScrolling: 'touch'}}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}>
                <TabPanel dir={theme.direction}>
                    <GroupStreams user={user}
                                  mobile={true}
                                  livestreamId={livestreamId}
                                  listenToUpcoming={listenToUpcoming}
                                  careerCenterId={careerCenterId}
                                  selectedOptions={selectedOptions}
                                  searching={searching}
                                  alreadyJoined={alreadyJoined}
                                  livestreams={livestreams}
                                  userData={userData}
                                  groupData={groupData}/>
                </TabPanel>
                <TabPanel dir={theme.direction}>
                    <GroupCategories alreadyJoined={alreadyJoined}
                                     groupData={groupData}
                                     user={user}
                                     livestreams={livestreams}
                                     userData={userData}
                                     handleToggleActive={handleToggleActive}
                                     mobile={true}/>
                </TabPanel>
            </SwipeableViews>
        </>
    );
}

export default withFirebase(MobileFeed)
