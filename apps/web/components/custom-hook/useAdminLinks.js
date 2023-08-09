import React, { useEffect, useState } from "react"
import {
   BarChart2 as StatisticsIcon,
   Film as StreamIcon,
   User as ProfileIcon,
   Search as FindIcon,
   Calendar as CalendarIcon,
} from "react-feather"
import { useAuth } from "../../HOCs/AuthProvider"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

const initialHeaderLinks = [
   {
      href: `/portal`,
      title: "PORTAL",
   },
   {
      href: `/next-livestreams`,
      title: "NEXT LIVE STREAMS",
   },
]
const initialDrawerBottomLinks = [
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
const useAdminLinks = () => {
   const { userData } = useAuth()
   const firebase = useFirebaseService()

   const [headerLinks, setHeaderLinks] = useState(initialHeaderLinks)
   const [drawerBottomLinks, setDrawerBottomLinks] = useState(
      initialDrawerBottomLinks
   )
   const [drawerTopLinks, setDrawerTopLinks] = useState([])

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
            {
               href: `/admin/query-users`,
               icon: FindIcon,
               title: "Query Users",
               basePath: `/admin/query-users`,
            },
            {
               href: `/admin/academic-calendar-manager`,
               icon: CalendarIcon,
               title: "Academic Calendar",
               basePath: `/admin/academic-calendar-manager`,
            },
         ])
      } else {
         setDrawerTopLinks([])
      }
   }, [userData?.isAdmin])

   return { drawerBottomLinks, drawerTopLinks, headerLinks }
}

export default useAdminLinks
