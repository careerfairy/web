import { useMemo } from "react"

// react feather
import {
   BarChart2 as AnalyticsIcon,
   Radio as LiveStreamsIcon,
   Sliders as ATSIcon,
   Users as RolesIcon,
} from "react-feather"

// project imports
import type { Group } from "@careerfairy/shared-lib/dist/groups"
import useFeatureFlags from "./useFeatureFlags"
import type { INavLink } from "../../layouts/types"

const baseHrefPath = "group"
const baseParam = "[groupId]"
const useDashboardLinks = (group?: Group): INavLink[] => {
   const featureFlags = useFeatureFlags()

   return useMemo(() => {
      if (!group?.id) return []

      const links: INavLink[] = [
         // {
         //    id: "main-page",
         //    href: `/${baseHrefPath}/${group.id}/admin`,
         //    pathname: `/${baseHrefPath}/${baseParam}/admin`,
         //    Icon: HomeIcon,
         //    title: "Main page",
         // },
         {
            id: "live-streams",
            title: "Live streams",
            Icon: LiveStreamsIcon,
            href: `/${baseHrefPath}/${group.id}/admin/events`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/events`,
         },
         {
            id: "analytics",
            href: `/${baseHrefPath}/${group.id}/admin/analytics`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/analytics`,
            Icon: AnalyticsIcon,
            title: "Analytics",
         },
         {
            id: "roles",
            href: `/${baseHrefPath}/${group.id}/admin/roles`,
            Icon: RolesIcon,
            pathname: `/${baseHrefPath}/${baseParam}/admin/roles`,
            title: "Roles",
         },
      ]

      if (featureFlags.atsAdminPageFlag || group.atsAdminPageFlag) {
         links.push({
            id: "ats",
            href: `/${baseHrefPath}/${group.id}/admin/ats-integration`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/ats-integration`,
            Icon: ATSIcon,
            title: "ATS integration",
         })
      }

      return links
   }, [featureFlags.atsAdminPageFlag, group?.atsAdminPageFlag, group?.id])
}

export default useDashboardLinks
