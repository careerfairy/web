import React, {useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {Container, Typography,} from "@material-ui/core";
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
                <Box p={1}>
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
        width: "100%"
    },
    bar: {
        backgroundColor: "transparent",
        boxShadow: "none",
    }
}));

const MobileFeed = ({userData, user, groupId, group, children}) => {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    return (
        <Container>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <div style={{backgroundColor: "pink", flex: 1, border: "1px solid pink", height: "80vh"}}/>
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <div style={{backgroundColor: "blue", flex: 1, border: "1px solid blue", height: "80vh"}}/>
                </TabPanel>
            </SwipeableViews>
            <AppBar className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    selectionFollowsFocus
                    centered
                >
                    <Tab wrapped fullWidth label={<Typography variant="h5">Categories</Typography>}/>
                    <Tab wrapped fullWidth label={<Typography variant="h5">Events</Typography>}/>
                </Tabs>
            </AppBar>
        </Container>
    );
}

export default withFirebase(MobileFeed)
