import React, {createContext, useContext, useState, useEffect} from "react";
import {useRouter} from "next/router";
import Loader from "../components/views/loader/Loader";

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
    "/group/create"
];
const AuthProvider = ({children, firebase}) => {
    const {pathname, replace, asPath} = useRouter();

    const [authenticatedUser, setAuthenticatedUser] = useState(undefined);
    const [userData, setUserData] = useState(undefined);

    useEffect(() => {
        if (authenticatedUser?.email) {
            const unsubscribe = firebase.listenToUserData(
                authenticatedUser.email,
                (querySnapshot) => {
                    if (querySnapshot.exists) {
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

        // Check that initial route is OK
        if (isSecurePath() && authenticatedUser === null) {
            replace({
                pathname: `/login`,
                query: {absolutePath: asPath},
            })
        } else if (isAdminPath() && userData && !userData.isAdmin) {
            replace(`/`);
        }


    }, [authenticatedUser, userData, pathname]);

    const isSecurePath = () => {
        return Boolean(securePaths.includes(pathname))
    }
    const isAdminPath = () => {
        return Boolean(adminPaths.includes(pathname))
    }

    const isAuthenticating = () => {
        return Boolean(authenticatedUser === undefined || userData === undefined)
    }

    if ((isSecurePath() || isAdminPath()) && isAuthenticating()) {
        return <Loader/>;
    }

    return (
        <AuthContext.Provider
            value={{authenticatedUser, userData, setUserData}}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export {AuthProvider, useAuth};
