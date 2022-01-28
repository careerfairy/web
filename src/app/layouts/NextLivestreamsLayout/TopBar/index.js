import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import { withFirebase } from "../../../context/firebase/FirebaseServiceContext";
import { Button, Hidden, useMediaQuery } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { MainLogo } from "../../../components/logos";
import Link from "../../../materialUI/NextNavLink";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import FilterIcon from "@material-ui/icons/Tune";
import { useDispatch } from "react-redux";
import * as actions from "../../../store/actions";
import { useAuth } from "../../../HOCs/AuthProvider";
import useGeneralHeader from "../../../components/custom-hook/useGeneralHeader";
import NavLinks from "../../../components/views/header/NavLinks";

const useStyles = makeStyles((theme) => ({
   navIconButton: {
      "&.MuiLink-underlineHover": {
         textDecoration: "none !important",
      },
   },
}));

const TopBar = ({ links, onMobileNavOpen, currentGroup }) => {
   const theme = useTheme();
   const showHeaderLinks = useMediaQuery(theme.breakpoints.up("md"));
   const { GeneralHeader, headerColors } = useGeneralHeader();
   const classes = useStyles({
      navLinksActiveColor: headerColors.navLinksActiveColor,
   });
   const dispatch = useDispatch();
   const { authenticatedUser } = useAuth();

   const handleToggleNextLivestreamsFilter = () =>
      dispatch(actions.toggleNextLivestreamsFilter());

   return (
      <GeneralHeader permanent={showHeaderLinks}>
         <Box display="flex" alignItems="center">
            <Hidden lgUp>
               <IconButton color="primary" onClick={onMobileNavOpen}>
                  <MenuIcon />
               </IconButton>
            </Hidden>
            <MainLogo />
         </Box>
         <Hidden mdDown>
            {showHeaderLinks && (
               <NavLinks
                  links={links}
                  navLinksActiveColor={theme.palette.primary.main}
               />
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
                     id="profile_icon"
                     component={Link}
                     color="primary"
                     className={classes.navIconButton}
                     href="/profile"
                  >
                     <AccountCircleOutlinedIcon />
                  </IconButton>
               )}
            </Hidden>
            {currentGroup?.categories && (
               <Hidden lgUp>
                  <IconButton
                     color="primary"
                     onClick={handleToggleNextLivestreamsFilter}
                  >
                     <FilterIcon />
                  </IconButton>
               </Hidden>
            )}
         </Box>
      </GeneralHeader>
   );
};
export default withFirebase(TopBar);
