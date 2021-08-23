import React, {useEffect, useState} from 'react';
import {User as ProfileIcon} from "react-feather";
import {useAuth} from "../../HOCs/AuthProvider";
import NextLivestreamsIcon from '@material-ui/icons/Contacts';
import FollowGroupIcon from '@material-ui/icons/GroupAdd';
import WishlistIcon from '@material-ui/icons/Stars';

const initialMainLinks = [
    {
        href: `/next-livestreams`,
        title: 'NEXT LIVE STREAMS',
        basePath: '/next-livestreams',
        icon: NextLivestreamsIcon
    },
    {
        href: `/wishlist`,
        title: 'WISHLIST',
        basePath: '/wishlist',
        icon: WishlistIcon
    },
    {
        href: `/groups`,
        title: 'FOLLOW GROUPS',
        basePath: '/groups',
        icon: FollowGroupIcon
    }
]
const initialSecondaryLinks = [
    {
        href: `/next-livestreams`,
        title: 'FOR STUDENTS',
        basePath: '/next-livestreams'
    },
    {
        href: `/`,
        title: 'FOR COMPANIES',
        basePath: '/'
    },
    {
        href: `/career-center`,
        title: 'FOR CAREER CENTERS',
        basePath: '/career-center'
    }
]

const landingLinks = [
  ...initialSecondaryLinks
]
const useGeneralLinks = () => {
    const {authenticatedUser} = useAuth()

    const [mainLinks] = useState(initialMainLinks);
    const [secondaryLinks, setSecondaryLinks] = useState(initialSecondaryLinks);

    useEffect(() => {
        if (authenticatedUser?.emailVerified) {
            setSecondaryLinks([...initialSecondaryLinks, {
                href: `/profile`,
                title: 'PROFILE',
                icon: ProfileIcon,
                basePath: '/profile'
            }])
        }

    }, [authenticatedUser?.emailVerified])


    return {secondaryLinks, mainLinks, landingLinks}
};

export default useGeneralLinks;
