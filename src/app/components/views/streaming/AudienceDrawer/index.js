import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import UsersTab from "./UsersTab";
import {AppBar, Box, IconButton, Tab, Tabs} from "@material-ui/core";
import SwipeableViews from 'react-swipeable-views';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import {SwipeablePanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import BreakdownTab from "./BreakdownTab";

const useStyles = makeStyles(theme => ({
    drawerContent: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        [theme.breakpoints.down("sm")]: {
            width: "100vw"
        },
        [theme.breakpoints.up("sm")]: {
            width: 400,
        }
    },
    panel: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflowX: "hidden"
    },
    audienceAppBar: {
        flexDirection: "row"
    },
    audienceTabs: {
        flex: 1
    }
}));


const AudienceDrawer = ({audienceDrawerOpen, hideAudience, isStreamer}) => {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(isStreamer ? 1 : 0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const tabs = [
        <Tab key={0} label="Total Participants"/>
    ]

    const panels = [
        <SwipeablePanel className={classes.panel} value={value} key={0} index={0} dir={theme.direction}>
            <UsersTab isStreamer={isStreamer}/>
        </SwipeablePanel>
    ]

    if (isStreamer) {
        tabs.push(
            <Tab key={1} label="Breakdown"/>
        )
        panels.push(
            <SwipeablePanel className={classes.panel} value={value} key={1} index={1} dir={theme.direction}>
                <BreakdownTab/>
            </SwipeablePanel>
        )
    }


    return (
        <Drawer
            PaperProps={{
                className: classes.drawerContent
            }}
            anchor="right"
            open={audienceDrawerOpen}
            onClose={hideAudience}>
            <AppBar className={classes.audienceAppBar} position="static" color="default">
                <Box p={0.5}>
                    <IconButton
                        onClick={hideAudience}
                        color="inherit"
                    >
                        <ArrowForwardIosIcon/>
                    </IconButton>
                </Box>
                <Tabs
                    value={value}
                    className={classes.audienceTabs}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    {tabs}
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                style={{flex: 1, display: "flex"}}
                containerStyle={{flex: 1}}
                onChangeIndex={handleChangeIndex}
            >
                {panels}
            </SwipeableViews>
        </Drawer>
    );
}

AudienceDrawer.propTypes = {
    audienceDrawerOpen: PropTypes.bool.isRequired,
    hideAudience: PropTypes.func.isRequired,
    isStreamer: PropTypes.bool.isRequired
}

export default AudienceDrawer

