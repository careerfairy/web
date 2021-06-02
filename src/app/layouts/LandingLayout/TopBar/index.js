import React, { useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
   AppBar,
   Box,
   Hidden,
   IconButton,
   Tab,
   Tabs,
   Toolbar,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import Link from "materialUI/NextNavLink";
import { MainLogo } from "components/logos";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useGeneralLinks from "components/custom-hook/useGeneralLinks";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import HideOnScroll from "../../../components/views/common/HideOnScroll";
import { useAuth } from "../../../HOCs/AuthProvider";
import LoginButton from "../../../components/views/common/LoginButton";

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
      fontWeight: 600,
      opacity: 1,
      // color: `${theme.palette.primary.contrastText} !important`,
      "&:before": {
         content: '""',
         position: "absolute",
         width: "100%",
         height: 2,
         bottom: 4,
         left: "0",
         backgroundColor: (props) => props.navLinksColor,
         visibility: "hidden",
         WebkitTransform: "scaleX(0)",
         transform: "scaleX(0)",
         transition: theme.transitions.create(["all"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
         }),
      },
      "&:hover:before": {
         visibility: "visible",
         WebkitTransform: "scaleX(1)",
         transform: "scaleX(1)",
      },
   },
   indicator: {
      background: (props) => props.navLinksColor,
      color: (props) => props.navLinksColor,
   },
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
      color: (props) => props.navLinksColor,
      background: "transparent",
   },
   whiteToolbar: {
      boxShadow: theme.shadows[3],
      background: theme.palette.common.white,
   },
}));

const TopBar = ({ className, ...rest }) => {
   const theme = useTheme();
   const classes = useStyles({
      navLinksColor: theme.palette.grey["800"],
   });

   const { mainLinks } = useGeneralLinks();
   const dispatch = useDispatch();
   const [scrolled, setScrolled] = useState(false);
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer());
   const { authenticatedUser } = useAuth();

   useEffect(() => {
      window.addEventListener("scroll", listenScrollEvent);
      return () => window.removeEventListener("scroll", listenScrollEvent);
   }, []);

   const listenScrollEvent = (e) => {
      setScrolled(Boolean(window?.scrollY > 40));
   };

   return (
      <HideOnScroll>
         <AppBar className={classes.root} elevation={0} {...rest}>
            <Toolbar
               className={clsx(classes.toolbar, classes.animated, {
                  [classes.whiteToolbar]: scrolled,
               })}
            >
               <MainLogo />
               <Hidden smDown>
                  <Tabs
                     value={false}
                     classes={{ indicator: classes.indicator }}
                  >
                     {mainLinks.map((item) => {
                        return (
                           <Tab
                              key={item.title}
                              className={classes.navLinks}
                              label={item.title}
                              href={item.href}
                           />
                        );
                     })}
                  </Tabs>
               </Hidden>
               <Box>
                  <Hidden mdDown>
                     {authenticatedUser.isLoaded &&
                     authenticatedUser.isEmpty ? (
                        <LoginButton />
                     ) : (
                        <IconButton
                           component={Link}
                           className={classes.navIconButton}
                           color="primary"
                           href="/profile"
                        >
                           <AccountCircleOutlinedIcon />
                        </IconButton>
                     )}
                  </Hidden>
                  <Hidden lgUp>
                     <IconButton color="primary" onClick={handleDrawerOpen}>
                        <MenuIcon />
                     </IconButton>
                  </Hidden>
               </Box>
            </Toolbar>
         </AppBar>
      </HideOnScroll>
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
