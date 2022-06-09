import * as React from "react"
import "styles.css"
import FirebaseServiceContext from "../context/firebase/FirebaseServiceContext"
import config from "@stahl.luke/react-reveal/globals"
import { newStore, wrapper } from "../store"
import NextNProgress from "nextjs-progressbar"
import { brandedLightTheme } from "../materialUI"
import Head from "next/head"
import ErrorSnackBar from "../components/views/common/ErrorSnackBar/ErrorSnackBar"
import ErrorContext from "../context/error/ErrorContext"
import TutorialContext from "../context/tutorials/TutorialContext"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import { AuthProvider } from "../HOCs/AuthProvider"
import { ReactReduxFirebaseProvider } from "react-redux-firebase"
import { createFirestoreInstance } from "redux-firestore"
import { Provider } from "react-redux"
import { CacheProvider } from "@emotion/react"
import createEmotionCache from "../materialUI/createEmotionCache"
import Notifier from "../components/views/notifier"
import CFCookieConsent from "../components/views/common/cookie-consent/CFCookieConsent"
import { useRouter } from "next/router"
import { firebaseServiceInstance } from "../data/firebase/FirebaseService"
import { ThemeProviderWrapper } from "../context/theme/ThemeContext"
import { useCallback, useEffect, useState } from "react"
import firebaseApp from "../data/firebase/FirebaseInstance"

import "../util/FirebaseUtils"
import useStoreReferralQueryParams from "../components/custom-hook/useStoreReferralQueryParams"
import UserRewardsNotifications from "../HOCs/UserRewardsNotifications"
import GoogleTagManager from "../HOCs/GoogleTagManager"
import useStoreUTMQueryParams from "../components/custom-hook/useStoreUTMQueryParams"

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

config({ ssrFadeout: true })

// react-redux-firebase config
const rrfConfig = {
   // userProfile: 'userData',
   useFirestoreForProfile: true, // Firestore for Profile instead of Realtime DB
   attachAuthIsReady: true, // attaches auth is ready promise to store
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

   // const classes = useStyles()

   const {
      pathname,
      query: { isRecordingWindow },
   } = useRouter()

   const [generalError, setGeneralError] = useState("")
   const [disableCookies, setDisableCookies] = useState(false)

   const initialTutorialState = {
      0: true,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      10: false,
      11: false,
      12: false,
      13: false,
      14: false,
      15: false,
      16: false,
      // ^ start of video controls tutorial ^
      17: false,
      18: false,
      19: false,
      20: false,
      21: false,
      22: false,
      23: false,
      24: false,
      streamerReady: false,
   }

   const [showBubbles, setShowBubbles] = useState(false)
   const [tutorialSteps, setTutorialSteps] = useState(initialTutorialState)

   useEffect(() => {
      setDisableCookies(
         Boolean(pathname === "/next-livestreams/[groupId]/embed")
      )
   }, [pathname])

   const getActiveTutorialStepKey = useCallback(() => {
      const activeStep = Object.keys(tutorialSteps).find((key) => {
         if (tutorialSteps[key]) {
            return key
         }
      })
      return Number(activeStep)
   }, [tutorialSteps])

   const endTutorial = () => {
      setTutorialSteps((prevState) => ({
         ...prevState,
         streamerReady: true,
      }))
   }

   const handleConfirmStep = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      })
   }

   const isOpen = (property, isTest) => {
      const activeStep = getActiveTutorialStepKey()
      if (isTest) {
         return Boolean(activeStep === property)
      }
      return Boolean(activeStep === property)
   }

   useStoreReferralQueryParams()
   useStoreUTMQueryParams()

   return (
      <CacheProvider value={emotionCache}>
         <Head>
            <meta
               name="viewport"
               content="initial-scale=1, width=device-width"
            />
            <title>CareerFairy | Watch live streams. Get hired.</title>
         </Head>
         <NextNProgress
            color={brandedLightTheme.palette.primary.main}
            options={{ showSpinner: false }}
         />
         <Provider store={store}>
            <ReactReduxFirebaseProvider {...rrfProps}>
               <TutorialContext.Provider
                  value={{
                     tutorialSteps,
                     setTutorialSteps,
                     showBubbles,
                     setShowBubbles,
                     getActiveTutorialStepKey,
                     handleConfirmStep,
                     isOpen,
                     endTutorial,
                  }}
               >
                  <AuthProvider>
                     <GoogleTagManager disableCookies={disableCookies}>
                        <ThemeProviderWrapper>
                           <FirebaseServiceContext.Provider
                              value={firebaseServiceInstance}
                           >
                              <LocalizationProvider
                                 dateAdapter={AdapterDateFns}
                              >
                                 <ErrorContext.Provider
                                    value={{ generalError, setGeneralError }}
                                 >
                                    {disableCookies ||
                                    isRecordingWindow ? null : (
                                       <CFCookieConsent />
                                    )}
                                    <UserRewardsNotifications>
                                       <Component {...pageProps} />
                                    </UserRewardsNotifications>
                                    <Notifier />
                                    <ErrorSnackBar
                                       handleClose={() => setGeneralError("")}
                                       errorMessage={generalError}
                                    />
                                 </ErrorContext.Provider>
                              </LocalizationProvider>
                           </FirebaseServiceContext.Provider>
                        </ThemeProviderWrapper>
                     </GoogleTagManager>
                  </AuthProvider>
               </TutorialContext.Provider>
            </ReactReduxFirebaseProvider>
         </Provider>
      </CacheProvider>
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
