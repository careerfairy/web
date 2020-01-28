// import App from 'next/app'
import '../semantic/dist/semantic.min.css';
import FirebaseContext from "../data/firebase/FirebaseContext";
import Firebase from "../data/firebase/Firebase";

function MyApp({ Component, pageProps }) {
    return (
        <FirebaseContext.Provider value={new Firebase()}>
            <Component {...pageProps} />
        </FirebaseContext.Provider>
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