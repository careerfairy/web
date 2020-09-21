import React, {useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import { Typography,} from "@material-ui/core";
import {withFirebase} from "../../../data/firebase";
import GroupCategories from "./GroupCategories/GroupCategories";
import GroupStreams from "./GroupStreams/GroupStreams";



function TabPanel(props) {
    const {children, value, index, ...other} = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={1}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const useStyles = makeStyles((theme) => ({

    bar: {
        boxShadow: "none",
        position: "sticky",
        top: 154
    }
}));

const MobileFeed = ({handleToggleActive, groupData, userData, alreadyJoined, user, value, handleChange, handleChangeIndex}) => {
    const classes = useStyles();
    const theme = useTheme();


    return (
        <>
            <AppBar className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    selectionFollowsFocus
                    centered
                >
                    <Tab wrapped fullWidth label={<Typography variant="h5">Events</Typography>}/>
                    {groupData.categories && <Tab wrapped fullWidth disabled={!groupData.categories}
                          label={<Typography variant="h5">Filter</Typography>}/>}
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel id="panel-category" value={value} index={0} dir={theme.direction}>
                    <GroupStreams user={user}
                                  userData={userData}
                                  groupData={groupData}/>
                </TabPanel>
                <TabPanel id="panel-streams" value={value} index={1} dir={theme.direction}>
                    <GroupCategories alreadyJoined={alreadyJoined}
                                     groupData={groupData}
                                     handleToggleActive={handleToggleActive}
                                     mobile={true}/>
                </TabPanel>
            </SwipeableViews>
        </>
    );
}

export default withFirebase(MobileFeed)
