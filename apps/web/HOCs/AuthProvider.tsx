import React, { createContext, useContext, useEffect, useMemo } from "react"
import { useRouter } from "next/router"
import dynamic from "next/dynamic"
import { useSelector } from "react-redux"
import { FirebaseReducer, useFirestoreConnect } from "react-redux-firebase"
import RootState from "../store/reducers"
import * as Sentry from "@sentry/nextjs"
import { firebaseServiceInstance } from "../data/firebase/FirebaseService"
import nookies from "nookies"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { UserData, UserStats } from "@careerfairy/shared-lib/dist/users"

const Loader = dynamic(() => import("../components/views/loader/Loader"), {
   ssr: false,
})

type DefaultContext = {
   authenticatedUser?: FirebaseReducer.AuthState
   userData?: UserData
   isLoggedOut: boolean
   userPresenter?: UserPresenter
   userStats?: UserStats
   isLoggedIn: boolean
}
const AuthContext = createContext<DefaultContext>({
   authenticatedUser: undefined,
   userData: undefined,
   isLoggedOut: undefined,
   isLoggedIn: undefined,
   userPresenter: undefined,
   userStats: undefined,
})

/**
 * Paths that require sign in
 */
const securePaths = [
   "/profile",
   "/groups",
   "/group/[groupId]/admin",
   "/group/[groupId]/admin/past-livestreams",
   "/group/[groupId]/admin/upcoming-livestreams",
   "/group/[groupId]/admin/drafts",
   "/group/[groupId]/admin/events",
   "/group/[groupId]/admin/roles",
   "/group/[groupId]/admin/edit",
   "/group/[groupId]/admin/analytics",
   "/group/[groupId]/admin/ats-integration",
   "/new-livestream",
   "/group/create",
]

const adminPaths = ["/group/create", "/new-livestream"]

const AuthProvider = ({ children }) => {
   const auth = useSelector((state: RootState) => state.firebase.auth)

   const { pathname, replace, asPath } = useRouter()

   const query = useMemo(
      () =>
         auth.email
            ? [
                 {
                    collection: "userData",
                    doc: auth.email, // or `userData/${auth.email}`
                    storeAs: "userProfile",
                 },
                 {
                    collection: "userData",
                    doc: auth.email,
                    subcollections: [{ collection: "stats", doc: "stats" }],
                    storeAs: "userStats",
                 },
              ]
            : [],
      [auth?.email]
   )

   useFirestoreConnect(query)

   const isLoggedOut = Boolean(auth.isLoaded && auth.isEmpty)
   const isLoggedIn = Boolean(auth.isLoaded && !auth.isEmpty)
   const userData = useSelector(({ firestore }: RootState) =>
      isLoggedOut ? undefined : firestore.data["userProfile"]
   )

   const userStats = useSelector(
      ({ firestore }: RootState) => firestore.data["userStats"]
   )

   useEffect(() => {
      // Check that initial route is OK
      if (isSecurePath() && isLoggedOut) {
         void replace({
            pathname: `/login`,
            query: { absolutePath: asPath },
         })
      } else if (isAdminPath() && userData && !userData.isAdmin) {
         void replace(`/`)
      }

      // Set Sentry User information
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/enriching-events/identify-user/
      if (auth?.isLoaded && auth?.uid) {
         try {
            Sentry.setUser({ id: auth.uid })
         } catch (e) {
            console.error(e)
         }
      }

      // Set Sentry User information
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/enriching-events/identify-user/
      if (auth?.isLoaded && auth?.uid) {
         try {
            Sentry.setUser({ id: auth.uid })
         } catch (e) {
            console.error(e)
         }
      }
   }, [auth, userData, pathname])

   // Backfill missing userData fields (if they don't exist)
   useEffect(() => {
      if (!userData) return

      const missingFields = ["referralCode"]

      if (
         Object.keys(userData).filter((f) => missingFields.includes(f))
            .length === 0
      ) {
         // There are missing fields
         firebaseServiceInstance
            .backfillUserData()
            .then((_) => console.log("Missing user data added."))
            .catch((e) => {
               Sentry.captureException(e)
               console.error(e)
            })
      }
   }, [userData])

   useEffect(() => {
      return firebaseServiceInstance.auth.onIdTokenChanged(async (user) => {
         if (!user) {
            nookies.set(undefined, "token", "", { path: "/" })
         } else {
            const token = await user.getIdToken()
            nookies.set(undefined, "token", token, { path: "/" })
         }
      })
   }, [])

   const isSecurePath = () => {
      return Boolean(securePaths.includes(pathname))
   }
   const isAdminPath = () => {
      return Boolean(adminPaths.includes(pathname))
   }

   if ((isSecurePath() || isAdminPath()) && !auth.isLoaded) {
      return <Loader />
   }

   return (
      <AuthContext.Provider
         value={{
            authenticatedUser: auth,
            userData: userData,
            isLoggedOut,
            isLoggedIn,
            userPresenter: userData ? new UserPresenter(userData) : undefined,
            userStats: userStats,
         }}
      >
         {children}
      </AuthContext.Provider>
   )
}

const useAuth = () => useContext<DefaultContext>(AuthContext)

export { AuthProvider, useAuth }
