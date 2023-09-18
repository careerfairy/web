import * as React from "react"
import "styles.css"
import FirebaseServiceContext from "../context/firebase/FirebaseServiceContext"
import config from "@stahl.luke/react-reveal/globals"
import { newStore, wrapper } from "../store"
import NextNProgress from "nextjs-progressbar"
import { brandedLightTheme } from "../materialUI"
import Head from "next/head"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { AuthProvider } from "../HOCs/AuthProvider"
import { ReactReduxFirebaseProvider } from "react-redux-firebase"
import { actionTypes, createFirestoreInstance } from "redux-firestore"
import { Provider } from "react-redux"
import { CacheProvider } from "@emotion/react"
import createEmotionCache from "../materialUI/createEmotionCache"
import Notifier from "../components/views/notifier"
import { firebaseServiceInstance } from "../data/firebase/FirebaseService"
import { ThemeProviderWrapper } from "../context/theme/ThemeContext"
import firebaseApp, {
   AuthInstance,
   firebaseConfig,
   FirestoreInstance,
   FunctionsInstance,
} from "../data/firebase/FirebaseInstance"

import "../util/FirebaseUtils"
import useStoreReferralQueryParams from "../components/custom-hook/useStoreReferralQueryParams"
import UserRewardsNotifications from "../HOCs/UserRewardsNotifications"
import useStoreUTMQueryParams from "../components/custom-hook/useStoreUTMQueryParams"
import TutorialProvider from "../HOCs/TutorialProvider"
import ErrorProvider from "../HOCs/ErrorProvider"
import {
   AuthProvider as ReactFireAuthProvider,
   FirebaseAppProvider,
   FirestoreProvider,
   FunctionsProvider,
} from "reactfire"
import FeatureFlagsProvider from "../HOCs/FeatureFlagsProvider"
import UserReminderProvider from "../HOCs/UserReminderProvider"
import SparksFeedTrackerProvider from "context/spark/SparksFeedTrackerProvider"

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

config({ ssrFadeout: true })

// react-redux-firebase config
const rrfConfig = {
   // userProfile: 'userData',
   useFirestoreForProfile: true, // Firestore for Profile instead of Realtime DB
   attachAuthIsReady: true, // attaches auth is ready promise to store
   /*  react-redux-firebase doesn't clear the userData or any data when the user
    *  logs out and logs back in with a different account, so we need to check that the id matches
    * [issue](https://github.com/prescottprue/redux-firestore/issues/114#issuecomment-415622171)
    */
   onAuthStateChanged: (authData, firebase, dispatch) => {
      // Clear redux-firestore state if auth does not exist (i.e logout)
      if (!authData) {
         dispatch({ type: actionTypes.CLEAR_DATA })
      }
   },
}

export const store = newStore()
const rrfProps = {
   firebase: firebaseApp,
   config: rrfConfig,
   dispatch: store.dispatch,
   createFirestoreInstance,
}

function MyApp(props) {
   const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
   useStoreReferralQueryParams()
   useStoreUTMQueryParams()

   return (
      <CacheProvider value={emotionCache}>
         <Head>
            <meta
               name="viewport"
               content="initial-scale=1, width=device-width, maximum-scale=1.0, user-scalable=0" //https://github.com/vercel/next.js/issues/7176
            />
            <title>CareerFairy | Watch live streams. Get hired.</title>
         </Head>
         <NextNProgress
            color={brandedLightTheme.palette.primary.main}
            options={{ showSpinner: false }}
         />
         <Provider store={store}>
            <ReactReduxFirebaseProvider {...rrfProps}>
               <ReactFireProviders>
                  <FeatureFlagsProvider>
                     <TutorialProvider>
                        <AuthProvider>
                           <ThemeProviderWrapper>
                              <FirebaseServiceContext.Provider
                                 value={firebaseServiceInstance}
                              >
                                 <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                 >
                                    <UserReminderProvider>
                                       <ErrorProvider>
                                          <UserRewardsNotifications>
                                             <SparksFeedTrackerProvider>
                                                <Component {...pageProps} />
                                             </SparksFeedTrackerProvider>
                                          </UserRewardsNotifications>
                                          <Notifier />
                                       </ErrorProvider>
                                    </UserReminderProvider>
                                 </LocalizationProvider>
                              </FirebaseServiceContext.Provider>
                           </ThemeProviderWrapper>
                        </AuthProvider>
                     </TutorialProvider>
                  </FeatureFlagsProvider>
               </ReactFireProviders>
            </ReactReduxFirebaseProvider>
         </Provider>
      </CacheProvider>
   )
}

const ReactFireProviders = ({ children }) => {
   return (
      <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense={true}>
         <FirestoreProvider sdk={FirestoreInstance as any}>
            <ReactFireAuthProvider sdk={AuthInstance as any}>
               <FunctionsProvider sdk={FunctionsInstance as any}>
                  {children}
               </FunctionsProvider>
            </ReactFireAuthProvider>
         </FirestoreProvider>
      </FirebaseAppProvider>
   )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default wrapper.withRedux(MyApp)
