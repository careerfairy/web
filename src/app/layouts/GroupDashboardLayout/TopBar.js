import React, {useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
    AppBar,
    Badge,
    Box,
    Hidden,
    IconButton,
    Toolbar,
    makeStyles
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import Link from '../../materialUI/NextNavLink'
import {MainLogo, MiniLogo} from "../../components/logos";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useStyles = makeStyles((theme) => ({
    avatar: {
        width: 60,
        height: 60
    },
    navIconButton: {
        color: "white !important"
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between"
    },
    navLinks: {
        fontWeight: 600,
        opacity: 1,
        color: `${theme.palette.primary.contrastText} !important`,
        "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: 2,
            bottom: 4,
            left: "0",
            backgroundColor: theme.palette.common.white,
            visibility: "hidden",
            WebkitTransform: "scaleX(0)",
            transform: "scaleX(0)",
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.complex,
            }),
        },
        "&:hover:before": {
            visibility: "visible",
            WebkitTransform: "scaleX(1)",
            transform: "scaleX(1)"
        }
    },
    indicator: {
        background: theme.palette.common.white,
        color: theme.palette.common.white
    },
    root: {
        // Ensures top bar's Zindex is always above the drawer
        zIndex: theme.zIndex.drawer + 1
    }
}));

const TopBar = ({className,notifications,setNotifications, links, onMobileNavOpen, ...rest}) => {
    const classes = useStyles();



    return (
        <AppBar elevation={1} className={clsx(classes.root, className)} {...rest}>
            <Toolbar className={classes.toolbar}>
                <Hidden smDown>
                    <MainLogo white/>
                </Hidden>
                <Hidden mdUp>
                    <MiniLogo/>
                </Hidden>
                <Hidden smDown>
                    <Tabs value={false} classes={{indicator: classes.indicator}}>
                        {links.map((item) => {
                            return (
                                <Tab
                                    key={item.title}
                                    className={classes.navLinks}
                                    label={item.title}
                                    href={item.href}
                                />
                            )
                        })}
                    </Tabs>
                </Hidden>
                <Hidden mdDown>
                    <Box>
                        {/* TODO : add notifications when companies submit drafts */}
                        <IconButton color="inherit">
                            <Badge
                                badgeContent={notifications.length}
                                color="primary"
                                variant="dot"
                            >
                                <NotificationsIcon/>
                            </Badge>
                        </IconButton>
                        <IconButton
                            component={Link}
                            className={classes.navIconButton}
                            href="/profile"
                        >
                            <AccountCircleOutlinedIcon/>
                        </IconButton>
                    </Box>
                </Hidden>
                <Hidden lgUp>
                    <IconButton color="inherit" onClick={onMobileNavOpen}>
                        <MenuIcon/>
                    </IconButton>
                </Hidden>
            </Toolbar>
        </AppBar>
    );
};

TopBar.propTypes = {
    className: PropTypes.string,
    onMobileNavOpen: PropTypes.func
};

export default TopBar;
