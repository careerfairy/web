import React, { useMemo } from "react"
import { useRouter } from "next/router"

// react feather
import {
   BarChart2 as AnalyticsIcon,
   Radio as LiveStreamsIcon,
   Sliders as ATSIcon,
   Home as HomeIcon,
} from "react-feather"

// material-ui
import AllLiveStreamsIcon from "@mui/icons-material/HistoryToggleOff"
import DomainIcon from "@mui/icons-material/Domain"
import Skeleton from "@mui/material/Skeleton"

// project imports
import { INavLink } from "../types"
import { useGroup } from "./index"
import NavList from "../common/NavList"
import useFeatureFlags from "../../components/custom-hook/useFeatureFlags"
import ATSStatus from "./ATSStatus"
import { SuspenseWithBoundary } from "../../components/ErrorBoundary"
import NewFeatureHint from "../../components/util/NewFeatureHint"
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"

const baseHrefPath = "group"
const baseParam = "[groupId]"

// Declare pathnames here if you are using them in multiple places
const companyPagePathName = `/${baseHrefPath}/${baseParam}/admin/page/[[...livestreamDialog]]`

const GroupNavList = () => {
   const { group, groupPresenter } = useGroup()

   const { push, pathname } = useRouter()

   const { layout } = useGroupDashboard()

   const featureFlags = useFeatureFlags()

   const showCompanyPageCTA = Boolean(
      !groupPresenter.companyPageIsReady() && // their company page is not ready yet
         companyPagePathName !== pathname && // they are not on the company page
         !group.universityCode && // they are not a university
         !layout.leftDrawerOpen // they are not on mobile
   )

   const navLinks = useMemo(() => {
      // Declare hrefs here if you are using them in multiple places
      const companyPageHref = `/${baseHrefPath}/${group.id}/admin/page`

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
                  pathname: `/${baseHrefPath}/${baseParam}/admin/events/all/[[...livestreamDialog]]`,
                  Icon: AllLiveStreamsIcon,
                  title: "All live streams on CareerFairy",
               },
            ],
         },
         {
            id: "company",
            title: "Company",
            Icon: DomainIcon,
            href: `/${baseHrefPath}/${group.id}/admin/edit`,
            wrapper: ({ children }) => (
               <NewFeatureHint
                  onClickConfirm={() => push(companyPageHref)}
                  backDrop
                  localStorageKey={"has-seen-company-page-cta"}
                  tooltipTitle="🚀 New feature: Company page!"
                  placement="right"
                  hide={showCompanyPageCTA}
                  tooltipText="We added company pages to CareerFairy. You can now create a dedicated page for your company and share it with your network of talent."
                  buttonText={"Manage company page"}
               >
                  {children}
               </NewFeatureHint>
            ),
            childLinks: [
               {
                  id: "general",
                  href: `/${baseHrefPath}/${group.id}/admin/edit`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/edit`,
                  title: "General",
               },
               {
                  id: "team-members",
                  href: `/${baseHrefPath}/${group.id}/admin/roles`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/roles`,
                  title: "Team members",
               },
               {
                  id: "page",
                  href: companyPageHref,
                  pathname: companyPagePathName,
                  title: "Company page",
               },
            ],
         },
         {
            id: "analytics",
            href: `/${baseHrefPath}/${group.id}/admin/analytics`,
            Icon: AnalyticsIcon,
            title: "Analytics",
            childLinks: [
               {
                  id: "general",
                  href: `/${baseHrefPath}/${group.id}/admin/analytics`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/analytics`,
                  title: "General",
               },
               ...(group.universityCode // Hide talent pool for universities
                  ? []
                  : [
                       {
                          id: "talent-pool",
                          href: `/${baseHrefPath}/${group.id}/admin/analytics/talent-pool`,
                          pathname: `/${baseHrefPath}/${baseParam}/admin/analytics/talent-pool`,
                          title: "Talent pool",
                       },
                    ]),
               {
                  id: "live-stream",
                  href: `/${baseHrefPath}/${group.id}/admin/analytics/live-stream`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/analytics/live-stream/[[...livestreamId]]`,
                  title: "Live stream analytics",
               },
               {
                  id: "registration-sources",
                  href: `/${baseHrefPath}/${group.id}/admin/analytics/registration-sources`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/analytics/registration-sources`,
                  title: "Registration sources",
               },
               {
                  id: "feedback",
                  href: `/${baseHrefPath}/${group.id}/admin/analytics/feedback`,
                  pathname: `/${baseHrefPath}/${baseParam}/admin/analytics/feedback/[[...feedback]]`,
                  title: "Feedback",
               },
            ],
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
   }, [
      group.id,
      group.universityCode,
      group.atsAdminPageFlag,
      featureFlags.atsAdminPageFlag,
      showCompanyPageCTA,
      push,
   ])

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
