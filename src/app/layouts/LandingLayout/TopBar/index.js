import React from "react";
import PropTypes from "prop-types";
import {
   Box,
   Hidden,
   IconButton,
   Tab,
   Tabs,
   Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import Link from "materialUI/NextNavLink";
import { MainLogo } from "components/logos";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useGeneralLinks from "components/custom-hook/useGeneralLinks";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../HOCs/AuthProvider";
import LoginButton from "../../../components/views/common/LoginButton";
import GeneralHeader from "../../../components/views/header/GeneralHeader";
import clsx from "clsx";
import { useRouter } from "next/router";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

const useStyles = makeStyles((theme) => ({
   avatar: {
      width: 60,
      height: 60,
   },
   navIconButton: {
      // color: "white !important"
   },
   toolbar: {
      display: "flex",
      justifyContent: "space-between",
      background: "transparent",
   },
   animated: {
      transition: theme.transitions.create(["background", "box-shadow"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   navLinks: {
      // fontWeight: 600,
      textDecoration: "none !important",
      color: theme.palette.common.black,
      textTransform: "none",
      padding: 0,
      opacity: 1,
      minWidth: 72,
      margin: theme.spacing(0, 4),
      transition: theme.transitions.create(["color"], {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.shortest,
      }),
      "&:before": {
         borderRadius: theme.spacing(1),
         content: '""',
         position: "absolute",
         width: 40,
         height: 2,
         bottom: 12,
         right: 0,
         backgroundColor: (props) => theme.palette.primary.main,
         visibility: "visible",
         WebkitTransform: "scaleX(1)",
         transform: "scaleX(1)",
         transition: theme.transitions.create(["all"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shortest,
         }),
      },
      "&:hover": {
         color: theme.palette.primary.main,
      },
      "&:hover:before": {
         bottom: 8,
         height: 4,
         width: "100%",
      },
   },
   indicator: {
      background: (props) => props.navLinksColor,
      color: (props) => props.navLinksColor,
   },
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
      // color: (props) => props.navLinksColor,
      background: "transparent",
   },
   whiteToolbar: {
      boxShadow: theme.shadows[3],
      background: theme.palette.common.white,
   },
   active: {
      color: theme.palette.primary.main,
      "&:before": {
         content: '""',
         position: "absolute",
         width: "100%",
         height: 4,
         bottom: 8,
         left: "0",
         backgroundColor: theme.palette.primary.main,
         visibility: "visible",
         WebkitTransform: "scaleX(1)",
         transform: "scaleX(1)",
      },
   },
   tabs: {
      display: "flex",
      justifyContent: "space-around",
   },
}));

const TopBar = ({ className, ...rest }) => {
   const theme = useTheme();
   const classes = useStyles({
      navLinksColor: theme.palette.primary.main,
   });
   const { pathname } = useRouter();
   const isScrolling = useScrollTrigger();

   const { landingLinks } = useGeneralLinks();
   const dispatch = useDispatch();
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer());
   const { authenticatedUser } = useAuth();

   return (
      <GeneralHeader permanent transparent>
         <Box display="flex" alignItems="center">
            <IconButton
               style={{ marginRight: "1rem" }}
               color="primary"
               onClick={handleDrawerOpen}
            >
               <MenuIcon />
            </IconButton>
            <MainLogo />
         </Box>
         <Hidden smDown>
            <Tabs
               className={classes.tabs}
               value={false}
               classes={{ indicator: classes.indicator }}
            >
               {landingLinks.map((item) => (
                  <Tab
                     key={item.title}
                     className={clsx(classes.navLinks, {
                        [classes.active]: pathname === item.href,
                     })}
                     component={Link}
                     disableRipple
                     label={<Typography variant="h6">{item.title}</Typography>}
                     href={item.href}
                  />
               ))}
            </Tabs>
         </Hidden>
         <Box display="flex" alignItems="center">
            <Hidden mdDown>
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <div>
                     <LoginButton />
                  </div>
               ) : (
                  <IconButton
                     id="profile_icon"
                     component={Link}
                     className={classes.navIconButton}
                     color="primary"
                     href="/profile"
                  >
                     <AccountCircleOutlinedIcon />
                  </IconButton>
               )}
            </Hidden>
         </Box>
      </GeneralHeader>
   );
};

TopBar.propTypes = {
   className: PropTypes.string,
   links: PropTypes.array,
   onMobileNavOpen: PropTypes.func,
};

TopBar.defaultProps = {
   links: [],
};
export default TopBar;
