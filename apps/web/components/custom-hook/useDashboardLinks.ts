import { useMemo } from "react"

// react feather
import {
   BarChart2 as AnalyticsIcon,
   Edit as EditGroupIcon,
   Radio as LiveStreamsIcon,
   Sliders as ATSIcon,
} from "react-feather"

// project imports
import type { Group } from "@careerfairy/shared-lib/dist/groups"
import useFeatureFlags from "./useFeatureFlags"
import { INavLink } from "../../types/layout"

const baseHrefPath = "group"
const baseParam = "[groupId]"
const useDashboardLinks = (group?: Group): INavLink[] => {
   const featureFlags = useFeatureFlags()

   return useMemo(() => {
      if (!group) return []

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
            id: "edit-group",
            Icon: EditGroupIcon,
            title: "Edit",
            href: `/${baseHrefPath}/${group.id}/admin/edit`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/edit`,
         },
      ]

      if (featureFlags.atsAdminPageFlag || group.atsAdminPageFlag) {
         links.push({
            id: "ats",
            href: `/${baseHrefPath}/${group.id}/admin/ats`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/ats`,
            Icon: ATSIcon,
            title: "ATS integration",
         })
      }

      return links
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [featureFlags.atsAdminPageFlag, group?.atsAdminPageFlag, group?.id])
}

export default useDashboardLinks
