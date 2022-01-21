import PropTypes from "prop-types";
import React, { useMemo, useRef, useState } from "react";
import NavBar from "./NavBar";
import { useRouter } from "next/router";
import { withFirebase } from "../../context/firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import { isEmpty, isLoaded } from "react-redux-firebase";
import { useSelector } from "react-redux";
import TopBar from "./TopBar";
import useDashboardRedirect from "../../components/custom-hook/useDashboardRedirect";
import useAdminGroup from "../../components/custom-hook/useAdminGroup";
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks";
import { Box, CircularProgress } from "@mui/material";
import { styles } from "materialUI/styles/layoutStyles/basicLayoutStyles";

const GroupDashboardLayout = (props) => {
   const { children, firebase } = props;
   const scrollRef = useRef(null);

   const {
      query: { groupId },
   } = useRouter();
   const [isMobileNavOpen, setMobileNavOpen] = useState(false);
   const { userData, authenticatedUser } = useAuth();
   const notifications = useSelector(
      ({ firestore }) => firestore.ordered.notifications || []
   );

   const group = useAdminGroup(groupId);
   useDashboardRedirect(group, firebase);

   const { headerLinks, drawerTopLinks, drawerBottomLinks } = useDashboardLinks(
      group
   );

   const isAdmin = useMemo(
      () =>
         userData?.isAdmin ||
         group?.adminEmails?.includes(authenticatedUser?.email),
      [userData?.isAdmin, group?.adminEmails, authenticatedUser?.email]
   );
   const isCorrectGroup = useMemo(() => groupId === group?.groupId, [
      groupId,
      group?.groupId,
   ]);

   return (
      <Box sx={styles.root}>
         <TopBar
            links={headerLinks}
            notifications={notifications}
            onMobileNavOpen={() => setMobileNavOpen(true)}
         />
         {isLoaded(group) && !isEmpty(group) && (
            <NavBar
               drawerTopLinks={drawerTopLinks}
               drawerBottomLinks={drawerBottomLinks}
               headerLinks={headerLinks}
               group={group}
               onMobileClose={() => setMobileNavOpen(false)}
               openMobile={isMobileNavOpen}
            />
         )}
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box ref={scrollRef} sx={styles.content}>
                  {isLoaded(group) && !isEmpty(group) && isCorrectGroup ? (
                     React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                           notifications,
                           isAdmin,
                           scrollRef,
                           group,
                           ...props,
                        })
                     )
                  ) : (
                     <CircularProgress style={{ margin: "auto" }} />
                  )}
               </Box>
            </Box>
         </Box>
      </Box>
   );
};

GroupDashboardLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
};

GroupDashboardLayout.defaultProps = {};
export default withFirebase(GroupDashboardLayout);
