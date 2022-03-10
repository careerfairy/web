import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { FirebaseReducer, useFirestoreConnect } from "react-redux-firebase";
import RootState from "../store/reducers";
import * as Sentry from "@sentry/nextjs";

const Loader = dynamic(() => import("../components/views/loader/Loader"), {
   ssr: false,
});

type DefaultContext = {
   authenticatedUser?: FirebaseReducer.AuthState;
   userData?: any;
   isLoggedOut: boolean;
};
const AuthContext = createContext<DefaultContext>({
   authenticatedUser: undefined,
   userData: undefined,
   isLoggedOut: undefined,
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
   const auth = useSelector((state: RootState) => state.firebase.auth);

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
      ({ firestore }: RootState) => firestore.data["userProfile"]
   );

   useEffect(() => {
      // Check that initial route is OK
      if (isSecurePath() && isLoggedOut()) {
         void replace({
            pathname: `/login`,
            query: { absolutePath: asPath },
         });
      } else if (isAdminPath() && userData && !userData.isAdmin) {
         void replace(`/`);
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
