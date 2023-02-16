import React, { useMemo } from "react"

// react feather
import {
   BarChart2 as AnalyticsIcon,
   Radio as LiveStreamsIcon,
   Sliders as ATSIcon,
   Users as RolesIcon,
   Home as HomeIcon,
} from "react-feather"

// material-ui
import AllLiveStreamsIcon from "@mui/icons-material/HistoryToggleOff"
import Skeleton from "@mui/material/Skeleton"

// project imports
import { INavLink } from "../types"
import { useGroup } from "./index"
import NavList from "../common/NavList"
import useFeatureFlags from "../../components/custom-hook/useFeatureFlags"
import ATSStatus from "./ATSStatus"
import { SuspenseWithBoundary } from "../../components/ErrorBoundary"

const baseHrefPath = "group"
const baseParam = "[groupId]"

const GroupNavList = () => {
   const { group } = useGroup()

   const featureFlags = useFeatureFlags()

   const navLinks = useMemo(() => {
      const links: INavLink[] = [
         {
            id: "main-page",
            href: `/${baseHrefPath}/${group.id}/admin`,
            pathname: `/${baseHrefPath}/${baseParam}/admin`,
            Icon: HomeIcon,
            title: "Main page",
         },
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
            rightElement: <SuspensefulATSStatus groupId={group.id} />,
         })
      }

      return links
   }, [featureFlags.atsAdminPageFlag, group.atsAdminPageFlag, group.id])

   return <NavList links={navLinks} />
}

const SuspensefulATSStatus = ({ groupId }: { groupId: string }) => {
   return (
      <SuspenseWithBoundary
         fallback={
            <Skeleton
               variant="circular"
               animation="pulse"
               width={8}
               height={8}
            />
         }
         hide
      >
         <ATSStatus groupId={groupId} />
      </SuspenseWithBoundary>
   )
}
export default GroupNavList
