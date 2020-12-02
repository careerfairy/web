import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {Container, Typography, useMediaQuery} from "@material-ui/core";
import Events from "./events/Events";
import Members from "./members/Members";
import Settings from "./settings/Settings";
import {withFirebase} from "../../../../context/firebase";

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
    root: {
       flex: 1
    },
    bar: {
        backgroundColor: "transparent",
        boxShadow: "none",
    }
}));

const GroupNav = ({userData, user, groupId, group}) => {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    return (
        <Container className={classes.root}>
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
                    {/* <Tab wrapped fullWidth label={<Typography variant="h5">Members</Typography>}/> */}
                    <Tab wrapped fullWidth label={<Typography variant="h5">Settings</Typography>}/>
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    {group?.id && <Events group={group} user={user} userData={userData} menuItem={"events"}/>}
                </TabPanel>
                {/* <TabPanel value={value} index={1} dir={theme.direction}>
                    <Members groupId={groupId}/>
                </TabPanel> */}
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <Settings group={group} groupId={groupId}/>
                </TabPanel>
            </SwipeableViews>
        </Container>
    );
}

export default withFirebase(GroupNav)
