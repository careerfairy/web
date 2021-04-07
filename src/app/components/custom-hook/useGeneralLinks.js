import React, {useEffect, useState} from 'react';
import {User as ProfileIcon} from "react-feather";
import {useAuth} from "../../HOCs/AuthProvider";

const initialMainLinks = [
    {
        href: `/next-livestreams`,
        title: 'NEXT LIVE STREAMS',
        basePath: '/next-livestreams'
    },
    {
        href: `/discover`,
        title: 'PAST LIVE STREAMS',
        basePath: '/discover'
    },
    {
        href: `/wishlist`,
        title: 'WISHLIST',
        basePath: '/wishlist'
    }
]
const initialSecondaryLinks = [
    {
        href: `https://corporate.careerfairy.io/companies`,
        title: 'FOR COMPANIES',
        basePath: 'https://corporate.careerfairy.io/companies'
    },
    {
        href: `https://corporate.careerfairy.io/career-center`,
        title: 'FOR CAREER CENTERS',
        basePath: 'https://corporate.careerfairy.io/career-center'
    }
]

const useGeneralLinks = () => {
    const {authenticatedUser} = useAuth()

    const [mainLinks, setMainLinks] = useState(initialMainLinks);
    const [secondaryLinks, setSecondaryLinks] = useState(initialSecondaryLinks);

    useEffect(() => {
        if (authenticatedUser?.emailVerified) {

            setMainLinks([...initialMainLinks, {
                href: `/groups`,
                title: 'FOLLOW GROUPS',
                basePath: '/groups'
            }])

            setSecondaryLinks([...initialSecondaryLinks, {
                href: `/profile`,
                title: 'PROFILE',
                icon: ProfileIcon,
                basePath: '/profile'
            }])
        }

    }, [authenticatedUser?.emailVerified])


    return {secondaryLinks, mainLinks}
};

export default useGeneralLinks;
