import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {Container} from "@material-ui/core";
import PersonalInfo from "./personal-info/PersonalInfo";
import MyGroups from "./my-groups/MyGroups";
import {withFirebase} from "../../../data/firebase";

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
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "rgb(250,250,250)",
        height: "100%",
        minHeight: "100vh",
    },
    bar: {
        backgroundColor: "transparent",
        boxShadow: "none"
    }
}));

const ProfileNav = ({userData}) => {
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
        <Container style={{marginTop: '50px'}}>
            <AppBar className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Personal Information"/>
                    <Tab label="My Groups"/>
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <PersonalInfo userData={userData}/>
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <MyGroups userData={userData}/>
                </TabPanel>
            </SwipeableViews>
        </Container>
    );
}

export default withFirebase(ProfileNav)
