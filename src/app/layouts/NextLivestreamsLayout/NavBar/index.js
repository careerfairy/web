import React, { memo, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import { Box, CircularProgress, Grow, Hidden } from "@material-ui/core";
import { useAuth } from "../../../HOCs/AuthProvider";
import { useRouter } from "next/router";
import {
   getResizedUrl,
   repositionElementInArray,
} from "../../../components/helperFunctions/HelperFunctions";
import NavItem from "../../../components/views/navbar/NavItem";
import { LogOut as LogoutIcon } from "react-feather";
import { useDispatch } from "react-redux";
import * as actions from "../../../store/actions";
import GroupNavLink from "./groupNavLink";
import NavPrompt from "./navPrompt";
import { signInImage } from "../../../constants/images";
import { withFirebase } from "context/firebase/FirebaseServiceContext";
import useFollowingGroups from "../../../components/custom-hook/useFollowingGroups";
import LoginButtonComponent from "components/views/common/LoginButton";

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
}));

const ListItemWrapper = ({ active, children }) =>
   active ? <Grow in>{children}</Grow> : <>{children}</>;

function LoginButton() {
   return (
      <ListItem>
         <LoginButtonComponent />
      </ListItem>
   );
}

const FeedDrawer = memo(
   ({
      onMobileNavOpen,
      onMobileClose,
      openMobile,
      handleDrawerToggle,
      drawerBottomLinks,
      drawerTopLinks,
      drawerWidth,
      firebase,
   }) => {
      const classes = useStyles({ drawerWidth });
      const {
         query: { groupId: groupIdInQuery },
         asPath,
      } = useRouter();
      const { userData, authenticatedUser } = useAuth();
      const [groups, setGroups] = useState(null);
      const dispatch = useDispatch();
      const signOut = () => dispatch(actions.signOut());
      const [followingGroups, loading] = useFollowingGroups(firebase);

      useEffect(() => {
         if (userData) {
            let newGroups = [...followingGroups];
            if (groupIdInQuery) {
               const activeGroupIndex = newGroups.findIndex(
                  (el) => el.groupId === groupIdInQuery
               );
               if (activeGroupIndex > -1) {
                  newGroups = repositionElementInArray(
                     newGroups,
                     activeGroupIndex,
                     0
                  );
               }
            }
            setGroups(newGroups);
         }
      }, [groupIdInQuery, followingGroups]);

      const content = (
         <Box height="100%" display="flex" flexDirection="column">
            <Hidden lgUp>
               <Box p={2}>
                  <List>
                     {authenticatedUser.isLoaded &&
                        authenticatedUser.isEmpty && <LoginButton />}
                     {drawerTopLinks.map(({ title, href, icon }) => (
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
            </Hidden>
            <Box display="flex" flexDirection="column" p={2}>
               {loading ? (
                  <CircularProgress style={{ margin: "auto" }} />
               ) : authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <NavPrompt
                     title="Don't have an account?"
                     subheader="Click here to register"
                     href={`/signup?absolutePath=${asPath}`}
                     imageSrc={signInImage}
                  />
               ) : groups?.length ? (
                  <List>
                     {groups?.map(({ universityName, groupId, logoUrl }) => (
                        <ListItemWrapper
                           key={groupId}
                           active={groupIdInQuery === groupId}
                        >
                           <GroupNavLink
                              key={groupId}
                              groupId={groupId}
                              onClick={onMobileClose}
                              groupIdInQuery={groupIdInQuery}
                              alt={universityName}
                              src={getResizedUrl(logoUrl, "xs")}
                           />
                        </ListItemWrapper>
                     ))}
                  </List>
               ) : (
                  <NavPrompt />
               )}
            </Box>
            <Box flexGrow={1} />
            <Box p={2}>
               <List>
                  <Divider />
                  {drawerBottomLinks.map((item) => (
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
         <>
            <Hidden lgUp>
               <Drawer
                  anchor="left"
                  classes={{
                     paper: clsx(classes.mobileDrawer, classes.background),
                  }}
                  className={classes.drawer}
                  onClose={onMobileClose}
                  open={openMobile}
                  variant="temporary"
               >
                  {content}
               </Drawer>
            </Hidden>
            <Hidden mdDown>
               <Drawer
                  anchor="left"
                  classes={{
                     paper: clsx(classes.desktopDrawer, classes.background),
                  }}
                  className={classes.drawer}
                  open
                  variant="persistent"
               >
                  {content}
               </Drawer>
            </Hidden>
         </>
      );
   }
);

export default withFirebase(FeedDrawer);
