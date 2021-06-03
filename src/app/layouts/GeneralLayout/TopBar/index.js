import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Hidden, IconButton, Tab, Tabs } from "@material-ui/core";
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
import useGeneralHeader from "../../../components/custom-hook/useGeneralHeader";
import clsx from "clsx";
import { useRouter } from "next/router";

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

const TopBar = ({ className, ...rest }) => {
   const { GeneralHeader, headerColors } = useGeneralHeader();
   const classes = useStyles({ navLinksColor: headerColors.navLinksColor });
   const { pathname } = useRouter();
   const { mainLinks } = useGeneralLinks();
   const dispatch = useDispatch();
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer());
   const { authenticatedUser } = useAuth();

   return (
      <GeneralHeader headerColors={headerColors} permanent>
         <MainLogo />
         <Hidden smDown>
            <Tabs value={false} classes={{ indicator: classes.indicator }}>
               {mainLinks.map((item) => {
                  return (
                     <Tab
                        key={item.title}
                        className={clsx(classes.navLinks, {
                           [classes.active]: pathname === item.href,
                        })}
                        label={item.title}
                        href={item.href}
                     />
                  );
               })}
            </Tabs>
         </Hidden>
         <Box>
            <Hidden mdDown>
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
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
            <IconButton color="primary" onClick={handleDrawerOpen}>
               <MenuIcon />
            </IconButton>
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
