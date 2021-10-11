import React from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import { withFirebase } from "../../../context/firebase";
import { Button, Hidden, useMediaQuery } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { useRouter } from "next/router";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { MainLogo } from "../../../components/logos";
import Link from "../../../materialUI/NextNavLink";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import FilterIcon from "@material-ui/icons/Tune";
import { useDispatch } from "react-redux";
import * as actions from "../../../store/actions";
import { useAuth } from "../../../HOCs/AuthProvider";
import useGeneralHeader from "../../../components/custom-hook/useGeneralHeader";

const useStyles = makeStyles((theme) => ({
   toolbar: {
      display: "flex",
      justifyContent: "space-between",
   },
   content: {
      flexGrow: 1,
      padding: theme.spacing(3),
   },
   root: {
      flexGrow: 1,
      background: theme.palette.navyBlue.main,
      zIndex: 1201,
   },
   navLinks: {
      fontWeight: 600,
      opacity: 1,
      color: (props) => `${props.navLinksColor} !important`,
      "&:hover": {
         textDecoration: "none !important",
      },
      "&:before": {
         content: '""',
         position: "absolute",
         width: "100%",
         height: 2,
         bottom: 0,
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
   navIconButton: {
      // color: "white !important",
      "&.MuiLink-underlineHover": {
         textDecoration: "none !important",
      },
   },
   active: {
      "&:before": {
         content: '""',
         position: "absolute",
         width: "100%",
         height: 2,
         bottom: 0,
         left: "0",
         backgroundColor: theme.palette.common.white,
         visibility: "visible",
         WebkitTransform: "scaleX(1)",
         transform: "scaleX(1)",
      },
   },
}));

const TopBar = ({ links, className, onMobileNavOpen, currentGroup }) => {
   const theme = useTheme();
   const showHeaderLinks = useMediaQuery(theme.breakpoints.up("md"));
   const { GeneralHeader, headerColors } = useGeneralHeader();
   const classes = useStyles({ navLinksColor: headerColors.navLinksColor });
   const { pathname } = useRouter();
   const dispatch = useDispatch();
   const { authenticatedUser } = useAuth();

   const handleToggleNextLivestreamsFilter = () =>
      dispatch(actions.toggleNextLivestreamsFilter());

   return (
      <GeneralHeader headerColors={headerColors} permanent={showHeaderLinks}>
         <MainLogo />
         <Hidden mdDown>
            {showHeaderLinks && (
               <Tabs
                  color="inherit"
                  value={false}
                  classes={{ indicator: classes.indicator }}
               >
                  {links.map((item) => {
                     return (
                        <Tab
                           key={item.title}
                           component={Link}
                           className={clsx(classes.navLinks, {
                              [classes.active]: pathname === item.href,
                           })}
                           label={item.title}
                           href={item.href}
                        />
                     );
                  })}
               </Tabs>
            )}
         </Hidden>
         <Box>
            <Hidden mdDown>
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <Button
                     component={Link}
                     href="/login"
                     variant="contained"
                     color="primary"
                     className={classes.navIconButton}
                  >
                     Login
                  </Button>
               ) : (
                  <IconButton
                     component={Link}
                     color="primary"
                     className={classes.navIconButton}
                     href="/profile"
                  >
                     <AccountCircleOutlinedIcon />
                  </IconButton>
               )}
            </Hidden>
            <Hidden lgUp>
               {currentGroup?.categories && (
                  <IconButton
                     color="primary"
                     onClick={handleToggleNextLivestreamsFilter}
                  >
                     <FilterIcon />
                  </IconButton>
               )}
               <IconButton color="primary" onClick={onMobileNavOpen}>
                  <MenuIcon />
               </IconButton>
            </Hidden>
         </Box>
      </GeneralHeader>
   );
};
export default withFirebase(TopBar);
