import PropTypes from "prop-types";
import React, { useMemo, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import NavBar from "./NavBar";
import { useRouter } from "next/router";
import { withFirebase } from "../../context/firebase/FirebaseServiceContext";
import { useAuth } from "../../HOCs/AuthProvider";
import { isEmpty, isLoaded } from "react-redux-firebase";
import { useSelector } from "react-redux";
import TopBar from "./TopBar";
import styles from "../../materialUI/styles/layoutStyles/groupDashboardStyles";
import useDashboardRedirect from "../../components/custom-hook/useDashboardRedirect";
import useAdminGroup from "../../components/custom-hook/useAdminGroup";
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles(styles);

const GroupDashboardLayout = (props) => {
   const { children, firebase } = props;
   const scrollRef = useRef(null);

   const classes = useStyles();
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
      <div className={classes.root}>
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
         <div className={classes.wrapper}>
            <div className={classes.contentContainer}>
               <div ref={scrollRef} className={classes.content}>
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
               </div>
            </div>
         </div>
      </div>
   );
};

GroupDashboardLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
};

GroupDashboardLayout.defaultProps = {};
export default withFirebase(GroupDashboardLayout);
