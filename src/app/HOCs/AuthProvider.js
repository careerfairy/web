import React, {createContext, useContext, useState, useEffect} from "react";
import {useRouter} from "next/router";
import Loader from "../components/views/loader/Loader";
import {useSelector} from "react-redux";
import { useFirestoreConnect } from 'react-redux-firebase'

const AuthContext = createContext();

const securePaths = [
    "/profile",
    "/groups",
    "/draft-stream",
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
    const { auth} = useSelector((state) => state.firebase)
    console.log("-> auth", auth);

    const {pathname, replace, asPath} = useRouter();

    const [authenticatedUser, setAuthenticatedUser] = useState(undefined);
    const [userData, setUserData] = useState(undefined);
    console.log("-> userData", userData);

    useFirestoreConnect(() => [
        { collection: 'todos', doc: todoId } // or `todos/${props.todoId}`
    ])

    useEffect(() => {
        if (auth.email) {
            const unsubscribe = firebase.listenToUserData(
                auth.email,
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
    }, [auth]);

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
        if (isSecurePath() && isLoggedOut()) {
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

    const isLoggedOut = () => auth.isLoaded && auth.isEmpty

    if ((isSecurePath() || isAdminPath()) && !auth.isLoaded) {
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
