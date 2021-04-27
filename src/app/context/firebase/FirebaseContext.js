import React, {useContext} from 'react';

const FirebaseContext = React.createContext(null)

export const withFirebase = Component => props => (
    <FirebaseContext.Consumer>
        {firebase => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
);

export const withFirebasePage = Page => {
    let element = props => {
        return(
            <FirebaseContext.Consumer>
                {firebase => <Page {...props} firebase={firebase} />}
            </FirebaseContext.Consumer>
        );
    };
    if  (Page.getInitialProps) {
        element.getInitialProps = Page.getInitialProps
    }
    return element;
}

export const useFirebase = () => useContext(FirebaseContext);

export default FirebaseContext;