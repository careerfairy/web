import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {Typography} from "@material-ui/core";
import Events from "./events/Events";
import Settings from "./settings/Settings";
import {withFirebase} from "../../../../context/firebase";
import {ResponsiveContainer} from "../../../../materialUI/GlobalContainers";

function TabPanel(props) {
    const {children, value, index, ...other} = props;
    return (

            value === index && (
                <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
                    {children}
                </div>
            )
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
       flex: 1,
        marginBottom: theme.spacing(1),
        minHeight: "50vh"
    },
    bar: {
        backgroundColor: "transparent",
        boxShadow: "none",
        marginBottom: theme.spacing(2)
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
        <ResponsiveContainer className={classes.root}>
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
                    <Tab wrapped fullWidth label={<Typography variant="h5">Settings</Typography>}/>
                </Tabs>
            </AppBar>
                <TabPanel value={value} index={0} dir={theme.direction}>
                  <Events group={group} user={user} userData={userData} menuItem={"events"}/>
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <Settings group={group} groupId={groupId}/>
                </TabPanel>
        </ResponsiveContainer>
    );
}

export default withFirebase(GroupNav)
