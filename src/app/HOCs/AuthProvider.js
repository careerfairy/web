import React, {createContext, useContext, useEffect, useMemo} from "react";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";

const Loader = dynamic(
    () => import('../components/views/loader/Loader'),
    {ssr: false}
)
import {useSelector} from "react-redux";
import {populate, useFirestoreConnect} from 'react-redux-firebase'

const AuthContext = createContext({authenticatedUser: undefined, userData: undefined});

const securePaths = [
    "/profile",
    "/groups",
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
    "/group/create",
    "/new-livestream"
];

const populates = [
    {child: 'groupIds', root: 'careerCenterData', childAlias: "followingGroups"},
]
const AuthProvider = ({children}) => {

    const auth = useSelector((state) => state.firebase.auth)

    const {pathname, replace, asPath} = useRouter();

    const query = useMemo(() => auth.email ? [
        {
            collection: 'userData', doc: auth.email,  // or `userData/${auth.email}`
            storeAs: "userProfile",
            populates
        }
    ] : [], [auth?.email])

    useFirestoreConnect(query)

    const userData = useSelector(({firestore}) => firestore.data.userProfile)

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


    }, [auth, userData, pathname]);

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
            value={{authenticatedUser: auth, userData}}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export {AuthProvider, useAuth};
