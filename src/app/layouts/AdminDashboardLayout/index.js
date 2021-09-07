import PropTypes from "prop-types";
import React, { useMemo, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import NavBar from "./NavBar";
import { withFirebase } from "../../context/firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import TopBar from "./TopBar";
import styles from "../../materialUI/styles/layoutStyles/groupDashboardStyles";
import { CircularProgress } from "@material-ui/core";
import useAdminLinks from "../../components/custom-hook/useAdminLinks";
import { useRouter } from "next/router";
import * as actions from "../../store/actions";
import { useDispatch } from "react-redux";

const useStyles = makeStyles(styles);

const AdminDashboardLayout = (props) => {
   const { children } = props;
   const classes = useStyles();
   const dispatch = useDispatch();
   const [isMobileNavOpen, setMobileNavOpen] = useState(false);
   const { userData, authenticatedUser } = useAuth();
   const { replace } = useRouter();
   const enqueueSnackbar = (...args) =>
      dispatch(actions.enqueueSnackbar(...args));

   const { headerLinks, drawerTopLinks, drawerBottomLinks } = useAdminLinks();

   useEffect(() => {
      (async function handleRedirect() {
         const unAuthorized =
            authenticatedUser.isLoaded &&
            (authenticatedUser.isEmpty ||
               (!authenticatedUser.isEmpty && userData && !userData.isAdmin));
         if (unAuthorized) {
            await replace("/");
            const message = "You do not have permission to visit this page";
            enqueueSnackbar({
               message,
               options: {
                  variant: "error",
                  preventDuplicate: true,
                  key: message,
               },
            });
         }
      })();
   }, [authenticatedUser, userData]);

   const isAdmin = useMemo(() => userData?.isAdmin, [userData?.isAdmin]);

   return (
      <div className={classes.root}>
         <TopBar
            links={headerLinks}
            onMobileNavOpen={() => setMobileNavOpen(true)}
         />
         {isAdmin && (
            <NavBar
               drawerTopLinks={drawerTopLinks}
               drawerBottomLinks={drawerBottomLinks}
               headerLinks={headerLinks}
               onMobileClose={() => setMobileNavOpen(false)}
               openMobile={isMobileNavOpen}
            />
         )}
         <div className={classes.wrapper}>
            <div className={classes.contentContainer}>
               <div className={classes.content}>
                  {isAdmin ? (
                     React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                           isAdmin,
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

AdminDashboardLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
};

AdminDashboardLayout.defaultProps = {};
export default withFirebase(AdminDashboardLayout);
