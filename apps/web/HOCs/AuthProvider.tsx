import React, {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useRouter } from "next/router"
import dynamic from "next/dynamic"
import { useSelector } from "react-redux"
import {
   FirebaseReducer,
   isLoaded,
   useFirestoreConnect,
} from "react-redux-firebase"
import RootState from "../store/reducers"
import * as Sentry from "@sentry/nextjs"
import nookies from "nookies"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import {
   AuthUserCustomClaims,
   UserData,
   UserStats,
} from "@careerfairy/shared-lib/dist/users"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import { usePreviousDistinct } from "react-use"
import DateUtil from "../util/DateUtil"
import { dataLayerUser } from "../util/analyticsUtils"
import { updateUserActivity } from "./user/trackActivity"
import { errorLogAndNotify } from "util/CommonUtil"
import CookiesUtil from "../util/CookiesUtil"
import { isAdminPath, isSecurePath, isSignupPath } from "util/AuthUtils"

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
   adminGroups?: AuthUserCustomClaims["adminGroups"]
   refetchClaims: () => Promise<void>
   signOut: () => Promise<void>
   isLoadingAuth: boolean
   isLoadingUserData: boolean
}

const AuthContext = createContext<DefaultContext>({
   authenticatedUser: undefined,
   userData: undefined,
   isLoggedOut: undefined,
   isLoggedIn: undefined,
   userPresenter: undefined,
   userStats: undefined,
   adminGroups: undefined,
   refetchClaims: () => Promise.resolve(),
   signOut: () => Promise.resolve(),
   isLoadingAuth: true,
   isLoadingUserData: true,
})

const AuthProvider = ({ children }) => {
   const auth = useSelector((state: RootState) => state.firebase.auth)

   const { pathname, replace, asPath } = useRouter()
   const firebaseService = useFirebaseService()
   const [claims, setClaims] = useState<{ [p: string]: any }>(null)

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
   const prevUserData = usePreviousDistinct<UserData>(userData)

   const userStats = useSelector(({ firestore }: RootState) =>
      isLoggedOut ? null : firestore.data["userStats"]
   )

   useEffect(() => {
      // Check that initial route is OK
      if (isSecurePath(pathname) && isLoggedOut) {
         void replace({
            pathname: `/login`,
            query: { absolutePath: asPath },
         })
      } else if (!isSignupPath(pathname) && isLoggedIn && !auth.emailVerified) {
         void replace(`/signup`)
      } else if (isAdminPath(pathname) && userData && !userData.isAdmin) {
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
   }, [auth, userData, pathname])

   // Backfill missing userData fields (if they don't exist)
   useEffect(() => {
      if (!userData) return

      const missingFields = ["referralCode", "timezone"]

      let missingFromUserData = missingFields.filter(
         (missing) => !userData[missing]
      )
      if (missingFromUserData.length > 0) {
         console.log(`Missing fields`, missingFromUserData)
         const browserTimezone = DateUtil.getCurrentTimeZone()

         // There are missing fields
         firebaseService
            .backfillUserData({ timezone: browserTimezone })
            .then((_) => console.log("Missing user data added."))
            .catch((e) => {
               Sentry.captureException(e)
               console.error(e)
            })
      }
   }, [userData])

   const refetchClaims = useCallback(async () => {
      if (!firebaseService.auth.currentUser) return null
      const token = await firebaseService.auth.currentUser.getIdTokenResult(
         true
      )
      setClaims(token.claims || null)
   }, [firebaseService.auth.currentUser])

   useEffect(() => {
      // get claims from auth

      const decodedToken = CookiesUtil.parseJwt({
         token: auth.stsTokenManager?.accessToken,
      })

      const issuedAt = decodedToken?.iat // time in seconds

      const issuedAtDateInMillis = issuedAt * 1000

      const refreshTokenTimeInMillis = userData?.refreshTokenTime?.toMillis?.()

      if (!refreshTokenTimeInMillis || !issuedAtDateInMillis) return

      /**
       * Check to see if we need to refresh the token
       * */

      // Token is considered stale if the refreshTokenTime is older than the token time the token was issued
      const isTokenStale = issuedAtDateInMillis < refreshTokenTimeInMillis // If the token is stale, refresh it

      if (isTokenStale) {
         // if token is expired or stale, refresh it
         void refetchClaims()
      }
   }, [
      refetchClaims,
      prevUserData,
      userData,
      userData?.refreshTokenTime,
      auth.stsTokenManager?.accessToken,
   ])

   /**
    * Listen for auth changes and update claims
    */
   useEffect(() => {
      return firebaseService.auth.onAuthStateChanged(async (user) => {
         if (!user) {
            nookies.set(undefined, "token", "", { path: "/" })
         } else {
            const tokenResult = await user.getIdTokenResult() // we get the token from the user, this does not make a network request

            setClaims(tokenResult.claims)

            nookies.set(undefined, "token", tokenResult.token, { path: "/" })
         }
      })
   }, [firebaseService.auth])

   /**
    * Update user activity when there are new claims
    */
   useEffect(() => {
      if (userData?.id && claims) {
         updateUserActivity(userData).catch(errorLogAndNotify)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userData?.id, claims])

   // update GTM user variables, useful to keep the values updated after login/logout/etc
   useEffect(() => {
      if (userData?.authId) {
         dataLayerUser(userData)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userData?.authId, userData?.isAdmin])

   const contextValue = useMemo<DefaultContext>(
      () => ({
         authenticatedUser: auth,
         userData: userData,
         isLoggedOut,
         isLoggedIn,
         userPresenter: userData ? new UserPresenter(userData) : undefined,
         userStats: userStats,
         adminGroups: claims?.adminGroups || {},
         refetchClaims,
         signOut: firebaseService.doSignOut,
         isLoadingAuth: !isLoaded(auth),
         isLoadingUserData: isLoggedOut ? false : Boolean(userData) === false,
      }),
      [
         auth,
         userData,
         isLoggedOut,
         isLoggedIn,
         userStats,
         claims?.adminGroups,
         refetchClaims,
         firebaseService.doSignOut,
      ]
   )

   if ((isSecurePath(pathname) || isAdminPath(pathname)) && !auth.isLoaded) {
      return <Loader />
   }

   return (
      <AuthContext.Provider value={contextValue}>
         {children}
      </AuthContext.Provider>
   )
}

const useAuth = () => useContext<DefaultContext>(AuthContext)

export { AuthProvider, useAuth }
