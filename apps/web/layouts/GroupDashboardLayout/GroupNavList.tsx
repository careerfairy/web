import { useRouter } from "next/router"
import { useMemo } from "react"

// react feather
import { BarChart2 as AnalyticsIcon, Sliders as ATSIcon } from "react-feather"

// material-ui
import AllLiveStreamsIcon from "@mui/icons-material/HistoryToggleOff"
import Skeleton from "@mui/material/Skeleton"

// project imports
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Box } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { CompanyIcon } from "components/views/common/icons"
import CircleIcon from "components/views/common/icons/CircleIcon"
import { HomeIcon } from "components/views/common/icons/HomeIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import { LiveStreamsIcon } from "components/views/common/icons/LiveStreamsIcon"
import { SparksIcon } from "components/views/common/icons/SparksIcon"
import useFeatureFlags from "../../components/custom-hook/useFeatureFlags"
import { SuspenseWithBoundary } from "../../components/ErrorBoundary"
import NewFeatureHint from "../../components/util/NewFeatureHint"
import NavList from "../common/NavList"
import { INavLink } from "../types"
import ATSStatus from "./ATSStatus"
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"
import { useGroup } from "./index"

const BASE_HREF_PATH = "group"
const BASE_PARAM = "[groupId]"

// Declare pathnames here if you are using them in multiple places
const companyPagePathName = `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/page/[[...livestreamDialog]]`

const GroupNavList = () => {
   const { group, groupPresenter, shrunkLeftMenuIsActive } = useGroup()

   const showSparksUpgradeWarning =
      groupPresenter.isTrialPlan() &&
      groupPresenter.getPlanDaysLeft() <=
         SPARK_CONSTANTS.SPARKS_NAV_TITLE_WARNING_PLAN_DAYS
   const { push, pathname } = useRouter()

   const { layout } = useGroupDashboard()

   const featureFlags = useFeatureFlags()

   const showCompanyPageCTA = Boolean(
      !groupPresenter.companyPageIsReady() && // their company page is not ready yet
         companyPagePathName !== pathname && // they are not on the company page
         !layout.leftDrawerOpen // they are not on mobile
   )

   const hasAccessToSparks =
      featureFlags.sparksAdminPageFlag || group.sparksAdminPageFlag

   const hasAtsIntegration =
      featureFlags.atsAdminPageFlag || group.atsAdminPageFlag

   const navLinks = useMemo(() => {
      // Declare hrefs here if you are using them in multiple places
      const companyPageHref = `/${BASE_HREF_PATH}/${group.id}/admin/page`

      const links: INavLink[] = [
         {
            id: "main-page",
            href: `/${BASE_HREF_PATH}/${group.id}/admin`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin`,
            Icon: HomeIcon,
            title: "Main page",
         },
         ...(hasAccessToSparks
            ? [
                 {
                    id: "sparks",
                    href: `/${BASE_HREF_PATH}/${group.id}/admin/sparks`,
                    Icon: SparksIcon,
                    title: "Sparks",
                    childLinks: [
                       {
                          id: "videos",
                          href: `/${BASE_HREF_PATH}/${group.id}/admin/sparks`,
                          pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/sparks`,
                          title: "Videos",
                          rightElement: (
                             <ConditionalWrapper
                                condition={showSparksUpgradeWarning}
                             >
                                <Box alignItems={"start"}>
                                   <CircleIcon sx={{ mr: "60px", mt: "px" }} />
                                </Box>
                             </ConditionalWrapper>
                          ),
                       },

                       {
                          id: "analytics",
                          href: `/${BASE_HREF_PATH}/${group.id}/admin/sparks/analytics`,
                          pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/sparks/analytics`,
                          title: "Analytics",
                       },
                    ],
                 },
              ]
            : []),
         {
            id: "live-streams",
            title: "Live streams",
            Icon: LiveStreamsIcon,
            href: `/${BASE_HREF_PATH}/${group.id}/admin/events`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events`,
            childLinks: [
               {
                  id: "all-live-streams",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/events/all`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events/all/[[...livestreamDialog]]`,
                  Icon: AllLiveStreamsIcon,
                  title: "All live streams on CareerFairy",
               },
            ],
         },
         ...(hasAtsIntegration
            ? []
            : [
                 {
                    id: "customJobs",
                    href: `/${BASE_HREF_PATH}/${group.id}/admin/jobs`,
                    pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/jobs/[[...jobId]]`,
                    Icon: JobsIcon,
                    title: "Jobs",
                 },
              ]),
         {
            id: "company",
            title: "Company",
            Icon: CompanyIcon,
            href: `/${BASE_HREF_PATH}/${group.id}/admin/edit`,
            wrapper: ({ children }) => (
               <NewFeatureHint
                  onClickConfirm={() => push(companyPageHref)}
                  backDrop
                  localStorageKey={"has-seen-company-page-cta"}
                  tooltipTitle="🚀 New feature: Company page!"
                  placement="right"
                  hide={Boolean(showCompanyPageCTA || group.universityCode)} // Don't show the hint for university Groups
                  tooltipText="We added company pages to CareerFairy. You can now create a dedicated page for your company and share it with your network of talent."
                  buttonText={"Manage company page"}
               >
                  {children}
               </NewFeatureHint>
            ),
            childLinks: [
               {
                  id: "general",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/edit`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/edit`,
                  title: "General",
               },
               {
                  id: "team-members",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/roles`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/roles`,
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
            href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics`,
            Icon: AnalyticsIcon,
            title: "Analytics",
            childLinks: [
               {
                  id: "general",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics`,
                  title: "General",
               },
               ...(group.universityCode // Hide talent pool for universities
                  ? []
                  : [
                       {
                          id: "talent-pool",
                          href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/talent-pool`,
                          pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/talent-pool`,
                          title: "Talent pool",
                       },
                    ]),
               {
                  id: "live-stream",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/live-stream`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/live-stream/[[...livestreamId]]`,
                  title: "Live stream analytics",
               },
               {
                  id: "registration-sources",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/registration-sources`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/registration-sources`,
                  title: "Registration sources",
               },
               {
                  id: "feedback",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/feedback`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/feedback/[[...feedback]]`,
                  title: "Feedback",
               },
            ],
         },
      ]

      if (hasAtsIntegration) {
         links.push({
            id: "ats",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/ats-integration`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/ats-integration`,
            Icon: ATSIcon,
            title: "ATS integration",
            rightElement: <SuspensefulATSStatus groupId={group.id} />,
         })
      }

      return links.map((link) => ({
         ...link,
         shrunk: shrunkLeftMenuIsActive,
      }))
   }, [
      group.id,
      group.universityCode,
      hasAccessToSparks,
      showSparksUpgradeWarning,
      hasAtsIntegration,
      showCompanyPageCTA,
      push,
      shrunkLeftMenuIsActive,
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
