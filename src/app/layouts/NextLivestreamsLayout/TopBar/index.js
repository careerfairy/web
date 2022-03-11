import React from "react";
import { useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import IconButton from "@mui/material/IconButton";
import { withFirebase } from "../../../context/firebase/FirebaseServiceContext";
import { Button, Hidden, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import { MainLogo } from "../../../components/logos";
import Link from "../../../materialUI/NextNavLink";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import FilterIcon from "@mui/icons-material/Tune";
import { useDispatch } from "react-redux";
import * as actions from "../../../store/actions";
import { useAuth } from "../../../HOCs/AuthProvider";
import useGeneralHeader from "../../../components/custom-hook/useGeneralHeader";
import NavLinks from "../../../components/views/header/NavLinks";
import MissingDataButton from "../../../components/views/missingData/MissingDataButton";

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
               <IconButton color="primary" onClick={onMobileNavOpen} size="large">
                  <MenuIcon />
               </IconButton>
            </Hidden>
            <MainLogo />
         </Box>
         <Hidden lgDown>
            {showHeaderLinks && (
               <NavLinks
                  links={links}
                  navLinksActiveColor={theme.palette.primary.main}
               />
            )}
         </Hidden>
         <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Hidden lgDown>
              <MissingDataButton />
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
                     size="large">
                     <AccountCircleOutlinedIcon />
                  </IconButton>
               )}
            </Hidden>
            {currentGroup?.categories && (
               <Hidden lgUp>
                  <IconButton color="primary" onClick={handleToggleNextLivestreamsFilter} size="large">
                     <FilterIcon />
                  </IconButton>
               </Hidden>
            )}
         </Box>
      </GeneralHeader>
   );
};
export default withFirebase(TopBar);
