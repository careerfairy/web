import React, {useState} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';

import {Container, Typography, useMediaQuery, AppBar, Tabs, Tab, Box} from "@material-ui/core";
import {withFirebase} from "context/firebase";
import JoinedGroups from "./my-groups/JoinedGroups";
import AdminGroups from "./my-groups/AdminGroups";
import UserData from "./user-data/UserData";
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {useAuth} from "../../../HOCs/AuthProvider";

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

const ProfileNav = ({userData}) => {
    const classes = useStyles();
    const theme = useTheme();
    const native = useMediaQuery(theme.breakpoints.down('xs'));
    const [value, setValue] = useState(0);
    const {authenticatedUser} = useAuth()

    useFirestoreConnect(() => [
        {
            collection: 'careerCenterData',
            where: userData.isAdmin ? ["test", "==", false] : ["adminEmails", "array-contains", authenticatedUser.email],
            storeAs: "adminGroups"
        }
    ])
    const adminGroups = useSelector(state => state.firestore.ordered["adminGroups"] || [])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const views = [
        <TabPanel key={0} value={value} index={0} dir={theme.direction}>
            <UserData userData={userData}/>
        </TabPanel>,
        <TabPanel key={1} value={value} index={1} dir={theme.direction}>
            <JoinedGroups userData={userData}/>
        </TabPanel>
    ]
    const tabsArray = [
        <Tab key={0} wrapped fullWidth
             label={<Typography noWrap
                                variant="h5">{native ? "Personal" : "Personal Information"}</Typography>}/>,
        <Tab key={1} wrapped fullWidth
             label={<Typography variant="h5">{native ? "Groups" : "Joined Groups"}</Typography>}/>,
    ]

    if (adminGroups.length) {
        views.push(<TabPanel key={2} value={value} index={2} dir={theme.direction}>
            <AdminGroups userData={userData} adminGroups={adminGroups}/>
        </TabPanel>)
        tabsArray.push(<Tab key={2} wrapped fullWidth
                            label={<Typography
                                variant="h5">{native ? "Admin" : "Admin Groups"}</Typography>}/>)
    }

    return (
        <Container style={{marginTop: '50px'}}>
            <AppBar className={classes.bar} position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    selectionFollowsFocus
                    centered
                >
                    {tabsArray}
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}>
                {views}
            </SwipeableViews>
        </Container>
    );
}

export default withFirebase(ProfileNav)
