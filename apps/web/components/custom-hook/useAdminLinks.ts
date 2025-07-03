import { CompanyIcon } from "components/views/common/icons"
import React, { useEffect, useState } from "react"
import {
   Calendar as CalendarIcon,
   User as ProfileIcon,
   BarChart2 as StatisticsIcon,
   Film as StreamIcon,
} from "react-feather"
import { useAuth } from "../../HOCs/AuthProvider"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

// Type definitions for link objects
interface AdminLink {
   href: string
   title: string
   basePath?: string
   icon?: React.ComponentType<any> | (() => React.JSX.Element)
}

interface UseAdminLinksReturn {
   drawerBottomLinks: AdminLink[]
   drawerTopLinks: AdminLink[]
   headerLinks: AdminLink[]
}

const initialHeaderLinks: AdminLink[] = [
   {
      href: `/portal`,
      title: "PORTAL",
   },
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
   },
]

const initialDrawerBottomLinks: AdminLink[] = [
   {
      href: `https://companies.careerfairy.io`,
      title: "FOR COMPANIES",
   },
   {
      href: `/career-center`,
      title: "FOR CAREER CENTERS",
   },
   {
      href: `/about-us`,
      title: "About Us",
      basePath: "/about-us",
   },
]

// Removed pushNotificationTesters array as it's no longer needed since push notifications are hidden

const useAdminLinks = (): UseAdminLinksReturn => {
   const { userData } = useAuth()
   const firebase = useFirebaseService()

   const [headerLinks, setHeaderLinks] =
      useState<AdminLink[]>(initialHeaderLinks)
   const [drawerBottomLinks, setDrawerBottomLinks] = useState<AdminLink[]>(
      initialDrawerBottomLinks
   )
   const [drawerTopLinks, setDrawerTopLinks] = useState<AdminLink[]>([])

   useEffect(() => {
      if (firebase.auth?.currentUser?.emailVerified) {
         setHeaderLinks([
            ...initialHeaderLinks,
            {
               href: `/groups`,
               title: "FOLLOW GROUPS",
               basePath: "/groups",
            },
         ])

         setDrawerBottomLinks([
            ...initialDrawerBottomLinks,
            {
               href: `/profile`,
               title: "PROFILE",
               icon: ProfileIcon,
               basePath: "/profile",
            },
         ])
      }
   }, [firebase.auth?.currentUser?.emailVerified])

   useEffect(() => {
      if (userData?.isAdmin) {
         setDrawerTopLinks([
            {
               href: `/admin/statistics`,
               icon: StatisticsIcon,
               title: "Statistics",
               basePath: `/admin/statistics`,
            },
            {
               href: `/admin/upcoming-livestreams`,
               icon: StreamIcon,
               title: "Upcoming Streams",
               basePath: `/admin/upcoming-livestreams`,
            },
            {
               href: `/admin/past-livestreams`,
               icon: StreamIcon,
               title: "Past Streams",
               basePath: `/admin/past-livestreams`,
            },
            // Hidden per request: Query Users and Push Notifications pages
            // {
            //    href: `/admin/query-users`,
            //    icon: FindIcon,
            //    title: "Query Users",
            //    basePath: `/admin/query-users`,
            // },
            // ...(pushNotificationTesters.includes(userData.userEmail)
            //    ? [
            //         {
            //            href: `/admin/saved-push-notifications`,
            //            icon: SmartphoneIcon,
            //            title: "Push Notifications",
            //            basePath: `/admin/saved-push-notifications`,
            //         },
            //      ]
            //    : []),
            {
               href: `/admin/academic-calendar-manager`,
               icon: CalendarIcon,
               title: "Academic Calendar",
               basePath: `/admin/academic-calendar-manager`,
            },
            {
               href: `/admin/company-plans`,
               icon: CompanyIcon,
               title: "Companies",
               basePath: `/admin/company-plans`,
            },
         ])
      } else {
         setDrawerTopLinks([])
      }
   }, [userData?.isAdmin, userData?.userEmail])

   return { drawerBottomLinks, drawerTopLinks, headerLinks }
}

export default useAdminLinks
