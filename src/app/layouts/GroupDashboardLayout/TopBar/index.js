import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
   AppBar,
   Badge,
   Box,
   Hidden,
   IconButton,
   Toolbar,
   Tooltip,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationIcon from "@material-ui/icons/NotificationsOutlined";
import ActiveNotificationIcon from "@material-ui/icons/Notifications";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import Link from "../../../materialUI/NextNavLink";
import { MainLogo, MiniLogo } from "../../../components/logos";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { maybePluralize } from "../../../components/helperFunctions/HelperFunctions";
import Notifications from "./Notifications";
import NavLinks from "../../../components/views/header/NavLinks";

const useStyles = makeStyles((theme) => ({
   navIconButton: {
      color: "white !important",
   },
   toolbar: {
      display: "flex",
      justifyContent: "space-between",
   },
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
   },
}));

const TopBar = ({
   className,
   notifications,
   links,
   onMobileNavOpen,
   ...rest
}) => {
   const theme = useTheme();
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
            <Box display="flex" alignItems="center">
               <Hidden lgUp>
                  <IconButton color="inherit" onClick={onMobileNavOpen}>
                     <MenuIcon />
                  </IconButton>
               </Hidden>
               <Hidden smDown>
                  <MainLogo white />
               </Hidden>
               <Hidden mdUp>
                  <MiniLogo />
               </Hidden>
            </Box>
            <Hidden smDown>
               <NavLinks
                  links={links}
                  navLinksActiveColor={theme.palette.common.white}
                  navLinksBaseColor={theme.palette.common.white}
               />
            </Hidden>
            <Box>
               <Tooltip
                  title={`You have ${
                     notifications.length
                  } unread ${maybePluralize(
                     notifications.length,
                     "notification"
                  )}`}
               >
                  <IconButton onClick={handleClick} color="inherit">
                     <Badge
                        badgeContent={notifications.length}
                        color="secondary"
                     >
                        {notificationAnchor ? (
                           <ActiveNotificationIcon />
                        ) : (
                           <NotificationIcon />
                        )}
                     </Badge>
                  </IconButton>
               </Tooltip>
               <Notifications
                  notifications={notifications}
                  handleClose={handleClose}
                  anchorEl={notificationAnchor}
               />
               <Hidden mdDown>
                  <IconButton
                     id="profile_icon"
                     component={Link}
                     className={classes.navIconButton}
                     href="/profile"
                  >
                     <AccountCircleOutlinedIcon />
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
   onMobileNavOpen: PropTypes.func,
};

TopBar.defaultProps = {
   links: [],
};
export default TopBar;
