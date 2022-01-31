import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {Paper, Tab, Tabs} from "@mui/material";
import {supportSections} from "../dumyData";
import {useRouter} from "next/router";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        boxShadow: theme.shadows[4],
        overflowY: "auto",
        '&::-webkit-scrollbar': {
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
        },
        position: "sticky",
        top: 165,
        maxHeight: "calc(100vh - 180px)"
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
        width: "100%",
        "&.MuiTab-root": {
            maxWidth: "auto"
        }
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
    const {pathname} = useRouter()

    return (
        <Paper className={classes.root}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={pathname}
                TabIndicatorProps={{classes: {root: classes.indicatorRoot}}}
                aria-label="Vertical tabs example"
                className={classes.tabs}
            >
                {supportSections.map((section, index) => (
                    <Tab
                        key={section.href}
                        value={section.href}
                        href={section.href}
                        label={section.title}
                        {...a11yProps(index)}
                    />
                ))}
            </Tabs>
        </Paper>
    );
};

export default SupportNav;
