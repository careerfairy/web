import React, { useMemo } from "react"

// react feather
import {
   BarChart2 as AnalyticsIcon,
   Radio as LiveStreamsIcon,
   Sliders as ATSIcon,
   Users as RolesIcon,
} from "react-feather"

// material-ui
import AllLiveStreamsIcon from "@mui/icons-material/HistoryToggleOff"

// project imports
import { INavLink } from "../types"
import { useGroup } from "./index"
import NavList from "../common/NavList"
import useFeatureFlags from "../../components/custom-hook/useFeatureFlags"
import useGroupATSAccounts from "../../components/custom-hook/useGroupATSAccounts"
import ATSStatus from "./ATSStatus"

const baseHrefPath = "group"
const baseParam = "[groupId]"

const GroupNavList = () => {
   const { group } = useGroup()

   const featureFlags = useFeatureFlags()

   const { data: accounts } = useGroupATSAccounts(group.id)

   const navLinks = useMemo(() => {
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
            childLinks: [
               {
                  id: "all-live-streams",
                  href: `/${baseHrefPath}/${group.id}/admin/events/all`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/events/all`,
                  Icon: AllLiveStreamsIcon,
                  title: "All live streams on CareerFairy",
               },
            ],
         },
         {
            id: "analytics",
            href: `/${baseHrefPath}/${group.id}/admin/analytics`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/analytics`,
            Icon: AnalyticsIcon,
            title: "Analytics",
         },
         {
            id: "team-members",
            href: `/${baseHrefPath}/${group.id}/admin/roles`,
            Icon: RolesIcon,
            pathname: `/${baseHrefPath}/${baseParam}/admin/roles`,
            title: "Team members",
         },
      ]

      if (featureFlags.atsAdminPageFlag || group.atsAdminPageFlag) {
         links.push({
            id: "ats",
            href: `/${baseHrefPath}/${group.id}/admin/ats-integration`,
            pathname: `/${baseHrefPath}/${baseParam}/admin/ats-integration`,
            Icon: ATSIcon,
            title: "ATS integration",
            rightElement: <ATSStatus accounts={accounts} />,
         })
      }

      return links
   }, [
      accounts,
      featureFlags.atsAdminPageFlag,
      group.atsAdminPageFlag,
      group.id,
   ])

   return <NavList links={navLinks} />
}

export default GroupNavList
