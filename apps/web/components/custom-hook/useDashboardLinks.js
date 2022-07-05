import React, { useEffect, useState } from "react"
import { isEmpty, isLoaded } from "react-redux-firebase"
import {
   BarChart2 as AnalyticsIcon,
   Edit as EditGroupIcon,
   Film as StreamIcon,
   User as ProfileIcon,
   Users as RolesIcon,
   Share2,
} from "react-feather"
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
      href: `/companies`,
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
const useDashboardLinks = (group) => {
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
      if (isLoaded(group) && !isEmpty(group)) {
         const baseHrefPath = "group"
         const baseParam = "[groupId]"
         setDrawerTopLinks([
            {
               href: `/${baseHrefPath}/${group.id}/admin/events`,
               icon: StreamIcon,
               title: "Events",
               basePath: `/${baseHrefPath}/${baseParam}/admin/events`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/edit`,
               icon: EditGroupIcon,
               title: "Edit Group Profile",
               basePath: `/${baseHrefPath}/${baseParam}/admin/edit`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/analytics`,
               icon: AnalyticsIcon,
               title: "Analytics",
               basePath: `/${baseHrefPath}/${baseParam}/admin/analytics`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/roles`,
               icon: RolesIcon,
               title: "Roles",
               basePath: `/${baseHrefPath}/${baseParam}/admin/roles`,
            },
            {
               href: `/${baseHrefPath}/${group.id}/admin/ats-integration`,
               icon: Share2,
               title: "ATS Integration",
               basePath: `/${baseHrefPath}/${baseParam}/admin/ats-integration`,
            },
         ])
      } else {
         setDrawerTopLinks([])
      }
   }, [group?.id])

   return { drawerBottomLinks, drawerTopLinks, headerLinks }
}

export default useDashboardLinks
