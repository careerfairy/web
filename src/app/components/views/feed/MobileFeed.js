import React, {useEffect, useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {virtualize} from 'react-swipeable-views-utils';

import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {Typography,} from "@material-ui/core";
import {withFirebase} from "../../../data/firebase";
import GroupCategories from "./GroupCategories/GroupCategories";
import GroupStreams from "./GroupStreams/GroupStreams";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);


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
        top: 110
    },
    panel: {
        minHeight: 300
    }
}));


const MobileFeed = ({handleToggleActive, groupData, userData, alreadyJoined, user, livestreams, searching, scrollToTop, livestreamId, careerCenterId}) => {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = useState(0);
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

    const slideRenderer = ({index, key}) => {// TODO prevent user from swiping out

        switch (index) {
            case 0:
                return <TabPanel value={0} index={index} key={key} dir={theme.direction}>
                    <GroupStreams user={user}
                                  key={key}
                                  mobile={true}
                                  careerCenterId={careerCenterId}
                                  livestreamId={livestreamId}
                                  searching={searching}
                                  livestreams={livestreams}
                                  userData={userData}
                                  groupData={groupData}/>
                </TabPanel>
            case 1:
                return <TabPanel value={1} index={index} key={key} dir={theme.direction}>
                    <GroupCategories alreadyJoined={alreadyJoined}
                                     key={key}
                                     groupData={groupData}
                                     handleToggleActive={handleToggleActive}
                                     mobile={true}/>
                </TabPanel>
            default:
                return <div key={key}/>
        }
    }


    return (
        <>
            <AppBar variant="elevation" className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    variant="fullWidth"
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab wrapped value={0}  {...a11yProps(0)} fullWidth label={<Typography variant="h5">Events</Typography>}/>
                    {groupData.categories ?
                        <Tab value={1} wrapped fullWidth disabled={!groupData.categories}
                             {...a11yProps(1)}
                             label={<Typography variant="h5">Filter</Typography>}/>
                        :
                        null}
                </Tabs>
            </AppBar>
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
                                  careerCenterId={careerCenterId}
                                  livestreamId={livestreamId}
                                  searching={searching}
                                  livestreams={livestreams}
                                  userData={userData}
                                  groupData={groupData}/>
                </TabPanel>
                {groupData.categories ? <TabPanel dir={theme.direction}>
                    <GroupCategories alreadyJoined={alreadyJoined}
                                     groupData={groupData}
                                     handleToggleActive={handleToggleActive}
                                     mobile={true}/>
                </TabPanel> : null}
            </SwipeableViews>
        </>
    );
}

export default withFirebase(MobileFeed)
