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

const useStyles = makeStyles(() => ({
    root: {},
    avatar: {
        width: 60,
        height: 60
    },
    navIconButton: {
        color: "white !important"
    }
}));

const TopBar = ({className, onMobileNavOpen, ...rest}) => {
    const classes = useStyles();
    const [notifications] = useState([2, 123, 3, 13]);

    return (
        <AppBar className={clsx(classes.root, className)} elevation={0} {...rest}>
            <Toolbar>
                <Hidden smDown>
                    <MainLogo white/>
                </Hidden>
                <Hidden mdUp>
                    <MiniLogo/>
                </Hidden>
                <Box flexGrow={1}/>
                <Hidden mdDown>
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
