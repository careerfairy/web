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
        "&:hover": {
            borderBottom: "2px solid white"
        }
    },
    indicator: {
        background: theme.palette.common.white,
        color: theme.palette.common.white
    }
}));

const TopBar = ({className, topNavItems, onMobileNavOpen, ...rest}) => {
    const classes = useStyles();
    const [notifications] = useState([2, 123, 3, 13]);


    return (
        <AppBar className={clsx(classes.root, className)} elevation={0} {...rest}>
            <Toolbar className={classes.toolbar}>
                <Hidden smDown>
                    <MainLogo white/>
                </Hidden>
                <Hidden mdUp>
                    <MiniLogo/>
                </Hidden>
                <Tabs classes={{indicator: classes.indicator}}>
                    {topNavItems.map((item) => {
                        return (
                            <Tab
                                className={classes.navLinks}
                                label={item.title}
                                href={item.href}
                            />
                        )
                    })}
                </Tabs>
                {/*<Box flexGrow={1}/>*/}
                <Hidden mdDown>
                    <Box>
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
