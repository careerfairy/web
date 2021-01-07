import React, {createContext, useContext, useState, useEffect} from "react";
import {useRouter} from "next/router";
import {withFirebase} from "../context/firebase";
import Loader from "../components/views/loader/Loader";
import {isEmptyObject} from "../components/helperFunctions/HelperFunctions";

const AuthContext = createContext();

const securePaths = [
    "/profile",
    "/groups",
    "/draft-stream",
    "/upcoming-livestream/[livestreamId]",
    "/streaming/[livestreamId]/viewer",
    "/group/[groupId]/admin",
    "/group/[groupId]/admin/past-livestreams",
    "/group/[groupId]/admin/upcoming-livestreams",
    "/group/[groupId]/admin/drafts",
    "/group/[groupId]/admin/edit",
    "/group/[groupId]/admin/analytics",
    "/new-livestream",
    "/group/create"
];
const adminPaths = [
    "/new-livestream",
    "/group/create"
];
const AuthProvider = ({children, firebase}) => {
    const {pathname, events, replace, asPath} = useRouter();
    const [user, setUser] = useState();

    const [authenticatedUser, setAuthenticatedUser] = useState(undefined);
    const [userData, setUserData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [hideLoader, setHideLoader] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (authenticatedUser && authenticatedUser.email) {
            const unsubscribe = firebase.listenToUserData(
                authenticatedUser.email,
                (querySnapshot) => {
                    if (querySnapshot.exists) {
                        setLoading(false);
                        let user = querySnapshot.data();
                        user.id = querySnapshot.id;
                        setUserData(user);
                    } else {
                        setUserData(null);
                    }
                }
            );
            return () => unsubscribe();
        }
    }, [authenticatedUser]);

    useEffect(() => {
        firebase.auth.onAuthStateChanged((user) => {
            if (user) {
                setAuthenticatedUser(user);
            } else {
                setAuthenticatedUser(null);
                setUserData(null);
            }
        });
    }, []);

    useEffect(() => {
        // Check that a new route is OK
        const handleRouteChange = (url) => {
            if (securePaths.includes(url) && authenticatedUser === null) {
                replace({
                    pathname: `/login`,
                    query: {absolutePath: asPath},
                })
            } else if (isAdminPath() && userData && !userData.isAdmin) {
                replace(`/`);
            }
        };

        // Check that initial route is OK
        if (isSecurePath() && authenticatedUser === null) {
            replace({
                pathname: `/login`,
                query: {absolutePath: asPath},
            })
        } else if (isAdminPath() && userData && !userData.isAdmin) {
            replace(`/`);
        }

        // Monitor routes
        events.on("routeChangeStart", handleRouteChange);
        return () => {
            events.off("routeChangeStart", handleRouteChange);
        };
    }, [authenticatedUser, userData]);

    const isSecurePath = () => {
        return Boolean(securePaths.includes(pathname))
    }
    const isAdminPath = () => {
        return Boolean(adminPaths.includes(pathname))
    }

    const isAuthenticating = () => {
        return Boolean(authenticatedUser === null || userData === null || loading === true)
    }

    if (isSecurePath() && isAuthenticating()) {
        return <Loader/>;
    }

    return (
        <AuthContext.Provider
            value={{authenticatedUser, userData, setUserData, loading, hideLoader}}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export {AuthProvider, useAuth};
