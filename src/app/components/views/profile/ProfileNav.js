import React, {useState, useEffect} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {Container, Typography, useMediaQuery} from "@material-ui/core";
import PersonalInfo from "./personal-info/PersonalInfo";
import {withFirebase} from "context/firebase";
import JoinedGroups from "./my-groups/JoinedGroups";
import AdminGroups from "./my-groups/AdminGroups";

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
        width: "100%"
    },
    bar: {
        backgroundColor: "transparent",
        boxShadow: "none",
    }
}));

const ProfileNav = ({userData, firebase}) => {
    const classes = useStyles();
    const theme = useTheme();
    const native = useMediaQuery(theme.breakpoints.down('xs'));
    const [value, setValue] = useState(1);

    const [adminGroups, setAdminGroups] = useState([]);

    useEffect(() => {
        if (userData) {
            firebase.listenCareerCentersByAdminEmail(userData.id, querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    careerCenters.push(careerCenter);
                })
                setAdminGroups(careerCenters);
            })
        }
    }, [userData])


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    return (
        <Container style={{marginTop: '50px', flex: 1}}>
            <AppBar className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    selectionFollowsFocus
                    centered
                >
                    <Tab wrapped fullWidth
                        label={<Typography noWrap
                                            variant="h5">{native ? "Personal" : "Personal Information"}</Typography>}/>
                    <Tab wrapped fullWidth
                        label={<Typography variant="h5">{native ? "Groups" : "My Groups"}</Typography>}/>
                    { adminGroups.length && 
                    <Tab wrapped fullWidth
                        label={<Typography
                            variant="h5">{native ? "Admin" : "Admin Groups"}</Typography>}/>}
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
                    <JoinedGroups userData={userData}/>
                </TabPanel>
                { adminGroups.length &&
                <TabPanel value={value} index={2} dir={theme.direction}>
                    <AdminGroups userData={userData} adminGroups={adminGroups}/>
                </TabPanel> }
            </SwipeableViews>
        </Container>
    );
}

export default withFirebase(ProfileNav)
