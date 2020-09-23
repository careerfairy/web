import {Fragment} from 'react';
import 'semantic/dist/semantic.min.css';
import 'styles.css';
import FirebaseContext from 'context/firebase/FirebaseContext';
import Firebase from 'data/firebase/Firebase';
import * as Sentry from '@sentry/browser';
import {ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import config from 'react-reveal/globals';
config({ ssrFadeout: true });
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import Head from 'next/head';
import {theme} from "../materialUI";
import UserContext from 'context/user/UserContext';

function MyApp({Component, pageProps}) {

    Sentry.init({dsn: "https://6852108b71ce4fbab24839792f82fa90@sentry.io/4261031"});

    
    const firebase = new Firebase();
    
    const [authenticatedUser, setAuthenticatedUser] = useState(null);
    const [userData, setUserData] = useState(null);
            
    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setAuthenticatedUser(user);
            } else {
                setAuthenticatedUser(null);
            }
        })
    }, []);

    useEffect(() => {
        if (authenticatedUser && authenticatedUser.email) {
           const unsubscribe = firebase.listenToUserData(authenticatedUser.email, querySnapshot => {
                if (querySnapshot.exists) {
                    let user = querySnapshot.data();
                    setUserData(user);
                } else {
                    setUserData(null);
                }              
            });
            return () => unsubscribe();
        }
    }, [authenticatedUser]);

    return (
        <Fragment>
            <Head>
                <title>CareerFairy | Watch live streams. Get hired.</title>
            </Head>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline/>
                <FirebaseContext.Provider value={firebase}>
                    <UserContext.Provider value={{authenticatedUser: authenticatedUser, userData: userData}}>
                        <Component {...pageProps} />
                    </UserContext.Provider>
                </FirebaseContext.Provider>
            </ThemeProvider>
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