import React, {useState} from 'react';
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
        top: 110
    },
    panel: {
        minHeight: 300
    }
}));


const MobileFeed = ({handleToggleActive, groupData, userData, alreadyJoined, user, livestreams, searching, scrollToTop}) => {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = useState(0);


    const handleChange = (event, newValue) => {
        scrollToTop()
        setValue(newValue);
    };

    const handleResetView = () => {
        setValue(0)
    }

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const slideRenderer = ({index, key}) => {

        switch (index) {
            case 0:
                return <GroupStreams user={user}
                                     key={key}
                                     mobile={true}
                                     searching={searching}
                                     livestreams={livestreams}
                                     userData={userData}
                                     groupData={groupData}/>

            case 1:
                return <GroupCategories alreadyJoined={alreadyJoined}
                                        key={key}
                                        groupData={groupData}
                                        handleToggleActive={handleToggleActive}
                                        mobile={true}/>
            default:
                return <div key={key}/>
        }
    }


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
                    {groupData.categories ?
                        <Tab wrapped fullWidth disabled={!groupData.categories}
                             label={<Typography variant="h5">Filter</Typography>}/>
                        :
                        null}
                </Tabs>
            </AppBar>
            <VirtualizeSwipeableViews slideRenderer={slideRenderer}
                                      containerStyle={{WebkitOverflowScrolling: 'touch'}}
                                      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                      index={value}
                                      onChangeIndex={handleChangeIndex}/>
        </>
    );
}

export default withFirebase(MobileFeed)
