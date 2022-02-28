import React, { useContext } from "react";
import { firebaseServiceInstance } from "../../data/firebase/FirebaseService";

const FirebaseServiceContext = React.createContext(firebaseServiceInstance);

// eslint-disable-next-line react/display-name
export const withFirebase = (Component) => (props) =>
   (
      <FirebaseServiceContext.Consumer>
         {(firebase) => <Component {...props} firebase={firebase} />}
      </FirebaseServiceContext.Consumer>
   );

export const withFirebasePage = (Page) => {
   let element = (props) => {
      return (
         <FirebaseServiceContext.Consumer>
            {(firebase) => <Page {...props} firebase={firebase} />}
         </FirebaseServiceContext.Consumer>
      );
   };
   if (Page.getInitialProps) {
      element.getInitialProps = Page.getInitialProps;
   }
   return element;
};

export const useFirebaseService = () => useContext(FirebaseServiceContext);

export default FirebaseServiceContext;
