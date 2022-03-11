import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { useFirestoreConnect } from "react-redux-firebase";
import * as Sentry from "@sentry/nextjs";
import { firebaseServiceInstance } from "../data/firebase/FirebaseService";

const Loader = dynamic(() => import("../components/views/loader/Loader"), {
   ssr: false,
});

const AuthContext = createContext({
   authenticatedUser: undefined,
   userData: undefined,
});

const securePaths = [
   "/profile",
   "/groups",
   "/group/[groupId]/admin",
   "/group/[groupId]/admin/past-livestreams",
   "/group/[groupId]/admin/upcoming-livestreams",
   "/group/[groupId]/admin/drafts",
   "/group/[groupId]/admin/edit",
   "/group/[groupId]/admin/analytics",
   "/new-livestream",
   "/group/create",
];
const adminPaths = ["/group/create", "/new-livestream"];

const AuthProvider = ({ children }) => {
   const auth = useSelector((state) => state.firebase.auth);

   const { pathname, replace, asPath } = useRouter();

   const query = useMemo(
      () =>
         auth.email
            ? [
                 {
                    collection: "userData",
                    doc: auth.email, // or `userData/${auth.email}`
                    storeAs: "userProfile",
                 },
              ]
            : [],
      [auth?.email]
   );

   useFirestoreConnect(query);

   const userData = useSelector(
      ({ firestore }) => firestore.data["userProfile"]
   );

   useEffect(() => {
      // Check that initial route is OK
      if (isSecurePath() && isLoggedOut()) {
         replace({
            pathname: `/login`,
            query: { absolutePath: asPath },
         });
      } else if (isAdminPath() && userData && !userData.isAdmin) {
         replace(`/`);
      }

      // Set Sentry User information
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/enriching-events/identify-user/
      if (auth?.isLoaded && auth?.uid) {
         try {
            Sentry.setUser({ id: auth.uid });
         } catch (e) {
            console.error(e);
         }
      }
   }, [auth, userData, pathname]);

   // Backfill missing userData fields (if they don't exist)
   useEffect(() => {
      if (!userData) return;

      const missingFields = ["referralCode"];

      if (
         Object.keys(userData).filter((f) => missingFields.includes(f))
            .length === 0
      ) {
         // There are missing fields
         firebaseServiceInstance
            .backfillUserData(userData.authId)
            .then((_) => console.log("Missing user data added."))
            .catch((e) => {
               Sentry.captureException(e);
               console.error(e);
            });
      }
   }, [userData]);

   const isSecurePath = () => {
      return Boolean(securePaths.includes(pathname));
   };
   const isAdminPath = () => {
      return Boolean(adminPaths.includes(pathname));
   };

   const isLoggedOut = () => auth.isLoaded && auth.isEmpty;

   if ((isSecurePath() || isAdminPath()) && !auth.isLoaded) {
      return <Loader />;
   }

   return (
      <AuthContext.Provider
         value={{
            authenticatedUser: auth,
            userData,
            isLoggedOut: Boolean(auth.isLoaded && auth.isEmpty),
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
