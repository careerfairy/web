import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, Tab, Tabs} from "@material-ui/core";
import SimpleTab from "../../../../materialUI/GlobalTabs/SimpleTab";

const useStyles = makeStyles(theme => ({
    indicator: {
        backgroundColor: theme.palette.common.white,
        height: theme.spacing(0.7),
        borderRadius: theme.spacing(1, 1, 0.3, 0.3)
    },
    root: {
        boxShadow: "none"
    },
    tab: {
        color: theme.palette.common.white,
        fontWeight: theme.typography.fontWeightBold
    }
}));

const StreamsTab = ({handleChange, value}) => {

    const classes = useStyles()

    return (
        <AppBar classes={{root: classes.root}} position="static"
                color="transparent">
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="inherit"
                classes={{indicator: classes.indicator}}
                variant="fullWidth"
                aria-label="full width tabs example"
            >
                <SimpleTab classes={{root: classes.tab}} label="Upcoming Events" index={0}/>
                <SimpleTab classes={{root: classes.tab}} label="Past Events" index={1}/>
            </Tabs>
        </AppBar>
    );
};

StreamsTab.propTypes = {
    handleChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
}

export default StreamsTab;
