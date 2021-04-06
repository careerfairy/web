import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {SwipeablePanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import {Paper, Tab, Tabs} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        height: 224,
        position: "sticky"
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    indicatorRoot: {
        left: "0",
        width: theme.spacing(0.5)
    }
}));

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const SupportNav = () => {

    const classes = useStyles()

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Paper className={classes.root}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                TabIndicatorProps={{classes: {root: classes.indicatorRoot}}}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                className={classes.tabs}
            >
                <Tab label="Item One" {...a11yProps(0)} />
                <Tab label="Item Two" {...a11yProps(1)} />
                <Tab label="Item Three" {...a11yProps(2)} />
                <Tab label="Item Four" {...a11yProps(3)} />
                <Tab label="Item Five" {...a11yProps(4)} />
                <Tab label="Item Six" {...a11yProps(5)} />
                <Tab label="Item Seven" {...a11yProps(6)} />
            </Tabs>
        </Paper>
    );
};

export default SupportNav;
