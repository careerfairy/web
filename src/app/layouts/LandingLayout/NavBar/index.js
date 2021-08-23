import React, { memo, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import { Box, Button, Grow, Hidden } from "@material-ui/core";
import { useAuth } from "../../../HOCs/AuthProvider";
import NavItem from "../../../components/views/navbar/NavItem";
import { LogOut as LogoutIcon } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../store/actions";
import Link from "../../../materialUI/NextNavLink";
import { withFirebase } from "context/firebase";
import useGeneralLinks from "../../../components/custom-hook/useGeneralLinks";

const useStyles = makeStyles((theme) => ({
   mobileDrawer: {
      width: (props) => props.drawerWidth || 256,
   },
   desktopDrawer: {
      width: (props) => props.drawerWidth || 256,
      top: 64,
      height: "calc(100% - 64px)",
      boxShadow: theme.shadows[1],
   },
   background: {
      borderRight: "none",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      // background: `linear-gradient(0deg, ${alpha(theme.palette.common.black, 0.3)}, ${alpha(theme.palette.common.black, 0.3)}), url(/next-livestreams-side.jpg)`,
   },
   name: {
      marginTop: theme.spacing(1),
   },
   drawerText: {
      color: theme.palette.common.white,
   },

   drawer: {
      flexShrink: 0,
      whiteSpace: "nowrap",
      "& ::-webkit-scrollbar": {
         width: "3px",
         backgroundColor: "transparent",
      },
      "& ::-webkit-scrollbar-thumb": {
         borderRadius: "10px",
         WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
         backgroundColor: "#555",
      },
   },

   loginButton: {
      color: "white !important",
   },
}));

const ListItemWrapper = ({ active, children }) =>
   active ? <Grow in>{children}</Grow> : <>{children}</>;

function LoginButton() {
   const classes = useStyles();
   return (
      <ListItem>
         <Button
            fullWidth
            className={classes.loginButton}
            component={Link}
            href="/login"
            style={{ textDecoration: "none" }}
            color="primary"
            variant="contained"
         >
            Login
         </Button>
      </ListItem>
   );
}

const NavBar = memo(({ drawerWidth }) => {
   const classes = useStyles({ drawerWidth });
   const { userData, authenticatedUser } = useAuth();
   const dispatch = useDispatch();
   const signOut = () => dispatch(actions.signOut());
   const { secondaryLinks, mainLinks } = useGeneralLinks();
   const openMobile = useSelector(
      (state) => state.generalLayout.layout.drawerOpen
   );
   const handleDrawerClose = () => dispatch(actions.closeNavDrawer());
   const handleDrawerToggle = () => dispatch(actions.toggleNavDrawer());

   useEffect(() => {
      return () => handleDrawerClose()
   },[])

   const content = (
      <Box height="100%" display="flex" flexDirection="column">
         <Box p={2}>
            <List>
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty && (
                  <LoginButton />
               )}
               {mainLinks.map(({ title, href, icon }) => (
                  <NavItem
                     href={href}
                     key={title}
                     title={title}
                     icon={icon}
                     black
                  />
               ))}
               <Divider />
            </List>
         </Box>
         <Box flexGrow={1} />
         <Box p={2}>
            <List>
               <Divider />
               {secondaryLinks.map((item) => (
                  <NavItem
                     href={item.href}
                     key={item.title}
                     title={item.title}
                     icon={item.icon}
                     black
                  />
               ))}
               {userData && (
                  <NavItem
                     href="#"
                     onClick={signOut}
                     icon={LogoutIcon}
                     title="LOGOUT"
                     black
                  />
               )}
            </List>
         </Box>
      </Box>
   );

   return (
      <Drawer
         anchor="left"
         classes={{ paper: clsx(classes.mobileDrawer, classes.background) }}
         className={classes.drawer}
         onClose={handleDrawerClose}
         open={openMobile}
         variant="temporary"
      >
         {content}
      </Drawer>
   );
});

export default withFirebase(NavBar);
