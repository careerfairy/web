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
import { MainLogo, MiniLogo } from "components/logos";
import { makeStyles } from "@material-ui/core/styles";
import useGeneralLinks from "components/custom-hook/useGeneralLinks";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import HideOnScroll from "../../../components/views/common/HideOnScroll";

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
         backgroundColor: theme.palette.common.black,
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
      background: theme.palette.common.black,
      color: theme.palette.common.black,
   },
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
      background: "transparent",
      color: theme.palette.common.black,
   },
   whiteHeader: {
      background: theme.palette.common.white,
   },
}));

const TopBar = ({ className, ...rest }) => {
   const classes = useStyles();

   const { mainLinks } = useGeneralLinks();
   const dispatch = useDispatch();
   const [scrolled, setScrolled] = useState(false);

   const handleDrawerOpen = () => dispatch(actions.openNavDrawer());

   useEffect(() => {
      window.addEventListener("scroll", listenScrollEvent);
      return () => window.removeEventListener("scroll", listenScrollEvent);
   }, []);

   const listenScrollEvent = (e) => {
      setScrolled(Boolean(window?.scrollY > 10));
   };

   return (
      <HideOnScroll>
         <AppBar
            elevation={scrolled ? 1 : 0}
            className={clsx(classes.root, className, {
               [classes.whiteHeader]: scrolled,
            })}
            {...rest}
         >
            <Toolbar className={classes.toolbar}>
               <Hidden smDown>
                  <MainLogo />
               </Hidden>
               <Hidden mdUp>
                  <MiniLogo />
               </Hidden>
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
                     <IconButton
                        component={Link}
                        className={classes.navIconButton}
                        color="primary"
                        href="/profile"
                     >
                        <AccountCircleOutlinedIcon />
                     </IconButton>
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
