import React, {Fragment, useEffect, useState} from 'react';
import 'semantic/dist/semantic.min.css';
import 'styles.css';
import FirebaseContext from 'context/firebase/FirebaseContext';
import Firebase from 'context/firebase';
import * as Sentry from '@sentry/browser';
import config from 'react-reveal/globals';
import DateFnsUtils from '@date-io/date-fns';
import {newStore, wrapper} from '../store';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import firebase from '../Firebase/Firebase';
import Head from 'next/head';
import TagManager from 'react-gtm-module'
import ErrorSnackBar from "../components/views/common/ErrorSnackBar/ErrorSnackBar";
import ErrorContext from "../context/error/ErrorContext";
import TutorialContext from 'context/tutorials/TutorialContext';
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import {AuthProvider} from "../HOCs/AuthProvider";
import {ReactReduxFirebaseProvider} from 'react-redux-firebase';
import {createFirestoreInstance} from "redux-firestore";
import {Provider} from "react-redux";
import {ThemeProviderWrapper} from "../context/theme/ThemeContext";
import {CssBaseline} from '@material-ui/core';
import Notifier from "../components/views/notifier";


config({ssrFadeout: true});


// react-redux-firebase config
const rrfConfig = {
    userProfile: 'userData',
    useFirestoreForProfile: true, // Firestore for Profile instead of Realtime DB
    attachAuthIsReady: true, // attaches auth is ready promise to store
};

export const store = newStore();
const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance
}

function MyApp({Component, pageProps}) {
    // const classes = useStyles()
    Sentry.init({dsn: "https://6852108b71ce4fbab24839792f82fa90@sentry.io/4261031"});


    const firebase = new Firebase();

    const [generalError, setGeneralError] = useState("");

    const initialTutorialState = {
        0: true, 1: false, 2: false, 3: false, 4: false,
        5: false, 6: false, 7: false, 8: false,
        9: false, 10: false, 11: false, 12: false,
        13: false, 14: false, 15: false, 16: false, 17: false,
        streamerReady: false,
    }

    const [showBubbles, setShowBubbles] = useState(false)
    const [tutorialSteps, setTutorialSteps] = useState(initialTutorialState)


    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    const tagManagerArgs = {
        gtmId: 'GTM-P29VCWC'
    }

    useEffect(() => {
        TagManager.initialize(tagManagerArgs);
    }, []);

    const getActiveTutorialStepKey = () => {
        const activeStep = Object.keys(tutorialSteps).find((key) => {
            if (tutorialSteps[key]) {
                return key
            }
        })
        return Number(activeStep)
    }

    const handleConfirmStep = (property) => {
        setTutorialSteps({
            ...tutorialSteps,
            [property]: false,
            [property + 1]: true,
        })
    }

    const isOpen = (property) => {
        const activeStep = getActiveTutorialStepKey()
        return Boolean(activeStep === property)
    }
    return (
        <Fragment>
            <Head>
                <title>CareerFairy | Watch live streams. Get hired.</title>
            </Head>
            <Provider store={store}>
                <ReactReduxFirebaseProvider {...rrfProps}>
                    <ThemeProviderWrapper>
                        <AuthProvider firebase={firebase}>
                            <FirebaseContext.Provider value={firebase}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>

                                    <TutorialContext.Provider value={{
                                        tutorialSteps,
                                        setTutorialSteps,
                                        showBubbles,
                                        setShowBubbles,
                                        getActiveTutorialStepKey,
                                        handleConfirmStep,
                                        isOpen
                                    }}>
                                        <ErrorContext.Provider value={{generalError, setGeneralError}}>
                                            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                                            <CssBaseline/>
                                            <Component {...pageProps} />
                                            <Notifier/>
                                            <ErrorSnackBar handleClose={() => setGeneralError("")}
                                                           errorMessage={generalError}/>
                                        </ErrorContext.Provider>
                                    </TutorialContext.Provider>
                                </MuiPickersUtilsProvider>
                            </FirebaseContext.Provider>
                        </AuthProvider>
                    </ThemeProviderWrapper>
                </ReactReduxFirebaseProvider>
            </Provider>
        </Fragment>
    );
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