import React, {useEffect, useState} from 'react';
import {
    Archive as PastStreamIcon,
    BarChart2 as StatisticsIcon,
    Film as StreamIcon,
    User as ProfileIcon
} from "react-feather";
import TableIcon from '@material-ui/icons/Toc';
import {useAuth} from "../../HOCs/AuthProvider";

const initialHeaderLinks = [
    {
        href: `/next-livestreams`,
        title: 'NEXT LIVE STREAMS'
    },
    {
        href: `/discover`,
        title: 'PAST LIVE STREAMS'
    },
    {
        href: `/wishlist`,
        title: 'WISHLIST'
    }
]
const initialDrawerBottomLinks = [
    {
        href: `https://corporate.careerfairy.io/companies`,
        title: 'FOR COMPANIES'
    },
    {
        href: `https://corporate.careerfairy.io/career-center`,
        title: 'FOR CAREER CENTERS'
    }
]
const useAdminLinks = () => {
    const {authenticatedUser, userData} = useAuth()

    const [headerLinks, setHeaderLinks] = useState(initialHeaderLinks);
    const [drawerBottomLinks, setDrawerBottomLinks] = useState(initialDrawerBottomLinks);
    const [drawerTopLinks, setDrawerTopLinks] = useState([]);

    useEffect(() => {
        if (authenticatedUser?.emailVerified) {
            setHeaderLinks([...initialHeaderLinks, {
                href: `/groups`,
                title: 'FOLLOW GROUPS',
                basePath: '/groups'
            }])

            setDrawerBottomLinks([...initialDrawerBottomLinks, {
                href: `/profile`,
                title: 'PROFILE',
                icon: ProfileIcon,
                basePath: '/profile'
            }])
        }

    }, [authenticatedUser?.emailVerified])

    useEffect(() => {
        if (userData?.isAdmin) {
            setDrawerTopLinks([
                {
                    href: `/admin/upcoming-livestreams`,
                    icon: StreamIcon,
                    title: 'Upcoming Streams',
                    basePath: `/admin/upcoming-livestreams`
                },
                {
                    href: `/admin/statistics`,
                    icon: StatisticsIcon,
                    title: 'Statistics',
                    basePath: `/admin/statistics`
                },
            ])
        } else {
            setDrawerTopLinks([])
        }
    }, [userData?.isAdmin])

    return {drawerBottomLinks, drawerTopLinks, headerLinks}
};

export default useAdminLinks;
