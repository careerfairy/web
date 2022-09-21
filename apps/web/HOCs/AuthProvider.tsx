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
import { FirebaseReducer, useFirestoreConnect } from "react-redux-firebase"
import RootState from "../store/reducers"
import * as Sentry from "@sentry/nextjs"
import nookies from "nookies"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { UserData, UserStats } from "@careerfairy/shared-lib/dist/users"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import { usePreviousDistinct } from "react-use"

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
   fetchClaims: () => Promise<{ [p: string]: any }>
}
const AuthContext = createContext<DefaultContext>({
   authenticatedUser: undefined,
   userData: undefined,
   isLoggedOut: undefined,
   isLoggedIn: undefined,
   userPresenter: undefined,
   userStats: undefined,
   fetchClaims: () => Promise.resolve({}),
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
   "/group/invite/[inviteId]",
]

const adminPaths = ["/group/create", "/new-livestream"]

const AuthProvider = ({ children }) => {
   const auth = useSelector((state: RootState) => state.firebase.auth)
   console.log("-> auth", auth)
   const { pathname, replace, asPath } = useRouter()
   const firebaseService = useFirebaseService()
   const [claims, setClaims] = useState(null)
   console.log("-> claims", claims)
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
         firebaseService
            .backfillUserData()
            .then((_) => console.log("Missing user data added."))
            .catch((e) => {
               Sentry.captureException(e)
               console.error(e)
            })
      }
   }, [userData])

   const fetchClaims = useCallback(async () => {
      if (!firebaseService.auth.currentUser) return null
      const token = await firebaseService.auth.currentUser.getIdTokenResult(
         true
      )
      return token.claims
   }, [firebaseService.auth.currentUser])

   // Get user claims
   useEffect(() => {
      // get claims from auth
      const tokenExpiration = auth.stsTokenManager?.expirationTime
      const refreshTokenTime = userData?.refreshTokenTime?.toMillis?.()
      if (!refreshTokenTime || !tokenExpiration) return

      /**
       * Check to see if we need to refresh the token
       * conditions:
       * 1. token is expired
       * 2. token is not expired, but the time difference between the token expiration and the refresh token time is greater than 1 hour
       * */

      const timeDifference = tokenExpiration - refreshTokenTime // in milliseconds
      const isTokenExpired = tokenExpiration < Date.now() // in milliseconds (now)
      const isTokenStale = timeDifference > 3600000 // in milliseconds (1 hour)

      if (isTokenExpired || isTokenStale) {
         // if token is expired or stale, refresh it
         fetchClaims().then(setClaims)
      }
   }, [
      auth.stsTokenManager?.expirationTime,
      fetchClaims,
      prevUserData,
      userData,
      userData?.refreshTokenTime,
   ])

   useEffect(() => {
      const unsub = firebaseService.auth.onIdTokenChanged(async (user) => {
         if (!user) {
            nookies.set(undefined, "token", "", { path: "/" })
         } else {
            const token = await user.getIdToken()
            nookies.set(undefined, "token", token, { path: "/" })
         }
      })

      return () => unsub()
   }, [firebaseService.auth])

   const contextValue = useMemo(
      () => ({
         authenticatedUser: auth,
         userData: userData,
         isLoggedOut,
         isLoggedIn,
         userPresenter: userData ? new UserPresenter(userData) : undefined,
         userStats: userStats,
         fetchClaims,
      }),
      [auth, isLoggedIn, isLoggedOut, fetchClaims, userData, userStats]
   )

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
      <AuthContext.Provider value={contextValue}>
         {children}
      </AuthContext.Provider>
   )
}

const useAuth = () => useContext<DefaultContext>(AuthContext)

export { AuthProvider, useAuth }
