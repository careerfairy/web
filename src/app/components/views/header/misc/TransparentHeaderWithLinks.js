import React from "react";
import PropTypes from "prop-types";
import { Box, Hidden, IconButton, Tab, Tabs } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Link from "materialUI/NextNavLink";
import { MainLogo } from "components/logos";
import { useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import useGeneralLinks from "components/custom-hook/useGeneralLinks";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import { useAuth } from "HOCs/AuthProvider";
import LoginButton from "components/views/common/LoginButton";
import GeneralHeader from "components/views/header/GeneralHeader";

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
         backgroundColor: (props) => props.navLinksActiveColor,
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
      background: (props) => props.navLinksActiveColor,
      color: (props) => props.navLinksActiveColor,
   },
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
      color: (props) => props.navLinksActiveColor,
      background: "transparent",
   },
   whiteToolbar: {
      boxShadow: theme.shadows[3],
      background: theme.palette.common.white,
   },
}));

const TransparentHeaderWithLinks = ({ className, ...rest }) => {
   const theme = useTheme();
   const classes = useStyles({
      navLinksActiveColor: theme.palette.common.white,
   });

   const { mainLinks } = useGeneralLinks();
   const dispatch = useDispatch();
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer());
   const { authenticatedUser } = useAuth();

   return (
      <GeneralHeader>
         <MainLogo />
         <Hidden mdDown>
            <Tabs value={false} classes={{ indicator: classes.indicator }}>
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
            <Hidden lgDown>
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <LoginButton />
               ) : (
                  <IconButton
                     id="profile_icon"
                     component={Link}
                     className={classes.navIconButton}
                     color="primary"
                     href="/profile"
                     size="large">
                     <AccountCircleOutlinedIcon />
                  </IconButton>
               )}
            </Hidden>
            <Hidden lgUp>
               <IconButton color="primary" onClick={handleDrawerOpen} size="large">
                  <MenuIcon />
               </IconButton>
            </Hidden>
         </Box>
      </GeneralHeader>
   );
};

TransparentHeaderWithLinks.propTypes = {
   className: PropTypes.string,
   links: PropTypes.array,
   onMobileNavOpen: PropTypes.func,
};

TransparentHeaderWithLinks.defaultProps = {
   links: [],
};
export default TransparentHeaderWithLinks;
