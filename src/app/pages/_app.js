// import App from 'next/app'
import { Fragment } from 'react';
import '../semantic/dist/semantic.min.css';
import FirebaseContext from "../data/firebase/FirebaseContext";
import Firebase from "../data/firebase/Firebase";

import Head from 'next/head';

function MyApp({ Component, pageProps }) {
    return (
        <Fragment>
            <Head>
                <title>CareerFairy | Watch live streams. Get hired.</title>
            </Head>
            <FirebaseContext.Provider value={new Firebase()}>
                <Component {...pageProps} />
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