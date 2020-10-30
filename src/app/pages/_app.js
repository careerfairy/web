import React, {Fragment, useState, useEffect} from 'react';
import 'semantic/dist/semantic.min.css';
import 'styles.css';
import FirebaseContext from 'context/firebase/FirebaseContext';
import Firebase from 'context/firebase';
import * as Sentry from '@sentry/browser';
import {ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import config from 'react-reveal/globals';

config({ssrFadeout: true});
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import Head from 'next/head';
import {theme} from "../materialUI";
import UserContext from 'context/user/UserContext';
import TagManager from 'react-gtm-module'
import ErrorSnackBar from "../components/views/common/ErrorSnackBar/ErrorSnackBar";
import ErrorContext from "../context/error/ErrorContext";
import {SnackbarProvider} from "notistack";

function MyApp({Component, pageProps}) {

    Sentry.init({dsn: "https://6852108b71ce4fbab24839792f82fa90@sentry.io/4261031"});


    const firebase = new Firebase();

    const [authenticatedUser, setAuthenticatedUser] = useState(undefined);
    const [userData, setUserData] = useState(undefined);
    const [loading, setLoading] = useState(false)
    const [hideLoader, setHideLoader] = useState(false)
    const [generalError, setGeneralError] = useState("");


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

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setAuthenticatedUser(user);
            } else {
                setAuthenticatedUser(null);
                setUserData(null);
            }
        })
    }, []);

    useEffect(() => {
        setLoading(true);
        if (authenticatedUser && authenticatedUser.email) {
            const unsubscribe = firebase.listenToUserData(authenticatedUser.email, querySnapshot => {
                if (querySnapshot.exists) {
                    setLoading(false)
                    let user = querySnapshot.data();
                    user.id = querySnapshot.id;
                    setUserData(user);
                } else {
                    setUserData(null);
                }
            });
            return () => unsubscribe();
        }
    }, [authenticatedUser]);

    useEffect(() => {
        if (authenticatedUser === null || userData === null || loading === true) {
            setHideLoader(true)
        }

    }, [authenticatedUser, userData, loading])


    return (
        <Fragment>
            <Head>
                <title>CareerFairy | Watch live streams. Get hired.</title>
            </Head>
            <FirebaseContext.Provider value={firebase}>
                <ThemeProvider theme={theme}>
                    <SnackbarProvider maxSnack={3}>
                        <UserContext.Provider value={{authenticatedUser, userData, setUserData, loading, hideLoader}}>
                            <ErrorContext.Provider value={{generalError, setGeneralError}}>
                                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                                <CssBaseline/>
                                <Component {...pageProps} />
                                <ErrorSnackBar handleClose={() => setGeneralError("")} errorMessage={generalError}/>
                            </ErrorContext.Provider>
                        </UserContext.Provider>
                    </SnackbarProvider>
                </ThemeProvider>
            </FirebaseContext.Provider>
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

export default MyApp