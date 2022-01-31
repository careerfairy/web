import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {AppBar, Badge, Box, Hidden, IconButton, Tab, Tabs, Toolbar, Tooltip} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationIcon from '@mui/icons-material/NotificationsOutlined';
import ActiveNotificationIcon from '@mui/icons-material/Notifications';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Link from '../../../../materialUI/NextNavLink'
import {MainLogo} from "../../../logos";
import makeStyles from '@mui/styles/makeStyles';
import {maybePluralize} from "../../../helperFunctions/HelperFunctions";
import Notifications from "./Notifications";
import topBarStyles from "../../../../materialUI/styles/topBarStyles";

const useStyles = makeStyles(topBarStyles);

const TopBar = ({className, notifications, links, onMobileNavOpen, ...rest}) => {
    const classes = useStyles();
    const [notificationAnchor, setNotificationAnchor] = React.useState(null);

    const handleClick = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setNotificationAnchor(null);
    };

    return (
        <AppBar elevation={1} className={clsx(classes.root, className)} {...rest}>
            <Toolbar className={classes.toolbar}>
                <MainLogo white/>
                <Hidden mdDown>
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
                <Box>
                    <Tooltip
                        title={`You have ${notifications.length} unread ${maybePluralize(notifications.length, "notification")}`}>
                        <IconButton onClick={handleClick} color="inherit" size="large">
                            <Badge
                                badgeContent={notifications.length}
                                color="secondary"
                            >
                                {notificationAnchor ? <ActiveNotificationIcon/> : <NotificationIcon/>}
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Notifications
                        notifications={notifications}
                        handleClose={handleClose}
                        anchorEl={notificationAnchor}
                    />
                    <Hidden lgDown>
                        <IconButton
                            component={Link}
                            className={classes.navIconButton}
                            href="/profile"
                            size="large">
                            <AccountCircleOutlinedIcon/>
                        </IconButton>
                    </Hidden>
                    <Hidden lgUp>
                        <IconButton color="inherit" onClick={onMobileNavOpen} size="large">
                            <MenuIcon/>
                        </IconButton>
                    </Hidden>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

TopBar.propTypes = {
    className: PropTypes.string,
    links: PropTypes.array,
    notifications: PropTypes.array,
    onMobileNavOpen: PropTypes.func
}

TopBar.defaultProps = {
    links: [],
    notifications: []
}
export default TopBar;

