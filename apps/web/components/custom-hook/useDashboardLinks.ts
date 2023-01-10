import { useEffect, useMemo, useState } from "react"
import { isEmpty, isLoaded } from "react-redux-firebase"
import {
   BarChart2 as AnalyticsIcon,
   Edit as EditGroupIcon,
   Film as StreamIcon,
   Share2,
   User as ProfileIcon,
   Users as RolesIcon,
   Home as HomeIcon,
   Radio as LiveStreamsIcon,
   Sliders as ATSIcon,
} from "react-feather"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import type { Group } from "@careerfairy/shared-lib/dist/groups"

import useFeatureFlags from "./useFeatureFlags"
import { INavItem } from "../../types/layout"

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

type Return = {
   drawerBottomLinks: any[]
   drawerTopLinks: any[]
   headerLinks: any[]
   mainLinks: INavItem[]
}
const baseHrefPath = "group"
const baseParam = "[groupId]"
const useDashboardLinks = (group?: Group): Return => {
   const firebase = useFirebaseService()
   const featureFlags = useFeatureFlags()

   const [headerLinks, setHeaderLinks] = useState<any[]>(initialHeaderLinks)
   const [drawerBottomLinks, setDrawerBottomLinks] = useState<any[]>(
      initialDrawerBottomLinks
   )
   const [drawerTopLinks, setDrawerTopLinks] = useState([])

   const groupDashboardMainLinks = useMemo(() => {
      if (!group) return []

      const links: INavItem[] = [
         {
            id: "main-page",
            href: `/${baseHrefPath}/${group.id}/admin`,
            pathName: `/${baseHrefPath}/${baseParam}/admin`,
            Icon: HomeIcon,
            title: "Main page",
            type: "item",
         },
         {
            id: "live-streams",
            type: "item",
            title: "Live streams",
            Icon: LiveStreamsIcon,
            href: `/${baseHrefPath}/${group.id}/admin/events`,
            pathName: `/${baseHrefPath}/${baseParam}/admin/events`,
         },
         {
            id: "analytics",
            href: `/${baseHrefPath}/${group.id}/admin/analytics`,
            pathName: `/${baseHrefPath}/${baseParam}/admin/analytics`,
            Icon: AnalyticsIcon,
            type: "item",
            title: "Analytics",
         },
         {
            id: "edit-group",
            Icon: EditGroupIcon,
            title: "Edit",
            type: "item",
            href: `/${baseHrefPath}/${group.id}/admin/edit`,
            pathName: `/${baseHrefPath}/${baseParam}/admin/edit`,
         },
      ]

      if (featureFlags.atsAdminPageFlag || group.atsAdminPageFlag) {
         links.push({
            id: "ats",
            href: `/${baseHrefPath}/${group.id}/admin/ats`,
            pathName: `/${baseHrefPath}/${baseParam}/admin/ats`,
            type: "item",
            Icon: ATSIcon,
            title: "ATS integration",
         })
      }

      return links
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [featureFlags.atsAdminPageFlag, group?.atsAdminPageFlag, group?.id])

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
         const links = [
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
         ]
         if (featureFlags.atsAdminPageFlag || group.atsAdminPageFlag) {
            links.push({
               href: `/${baseHrefPath}/${group.id}/admin/ats-integration`,
               icon: Share2,
               title: "ATS Integration",
               basePath: `/${baseHrefPath}/${baseParam}/admin/ats-integration`,
            })
         }

         setDrawerTopLinks(links)
      } else {
         setDrawerTopLinks([])
      }
   }, [group?.id, featureFlags.atsAdminPageFlag, group])

   return useMemo(
      () => ({
         drawerBottomLinks,
         drawerTopLinks,
         headerLinks,
         mainLinks: groupDashboardMainLinks,
      }),
      [drawerBottomLinks, drawerTopLinks, groupDashboardMainLinks, headerLinks]
   )
}

export default useDashboardLinks
