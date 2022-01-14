import React from "react";
import PropTypes from "prop-types";
import { Box, Hidden, IconButton } from "@material-ui/core";
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
import NavLinks from "../../../components/views/header/NavLinks";

const useStyles = makeStyles((theme) => ({
   navIconButton: {
      "&.MuiLink-underlineHover": {
         textDecoration: "none !important",
      },
   },
}));

const TopBar = ({ headerProps, navLinksProps }) => {
   const theme = useTheme();
   const { GeneralHeader, headerColors } = useGeneralHeader();
   const classes = useStyles({
      navLinksActiveColor: headerColors.navLinksActiveColor,
   });
   const { mainLinks } = useGeneralLinks();
   const dispatch = useDispatch();
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer());
   const { authenticatedUser } = useAuth();

   return (
      <GeneralHeader headerColors={headerColors} permanent {...headerProps}>
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
            <NavLinks
               links={mainLinks}
               navLinksActiveColor={theme.palette.primary.main}
               {...navLinksProps}
            />
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
