import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import NavBar from "./NavBar";
import { withFirebase } from "../../context/firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import TopBar from "./TopBar";
import { Box, CircularProgress } from "@mui/material";
import useAdminLinks from "../../components/custom-hook/useAdminLinks";
import { useRouter } from "next/router";
import * as actions from "../../store/actions";
import { useDispatch } from "react-redux";
import { styles } from "materialUI/styles/layoutStyles/basicLayoutStyles";

const AdminDashboardLayout = (props) => {
   const { children } = props;
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
      <Box sx={styles.root}>
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
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box sx={styles.content}>
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
               </Box>
            </Box>
         </Box>
      </Box>
   );
};

AdminDashboardLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
};

AdminDashboardLayout.defaultProps = {};
export default withFirebase(AdminDashboardLayout);
