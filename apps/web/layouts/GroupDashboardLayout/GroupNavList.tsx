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
import {
   CompanyProfileIcon,
   ContentIcon,
   TalentPoolIcon,
} from "components/views/common/icons"
import CircleIcon from "components/views/common/icons/CircleIcon"
import { HomeIcon } from "components/views/common/icons/HomeIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import { LiveStreamsIcon } from "components/views/common/icons/LiveStreamsIcon"
import { SparksIcon } from "components/views/common/icons/SparksIcon"
import useFeatureFlags from "../../components/custom-hook/useFeatureFlags"
import { SuspenseWithBoundary } from "../../components/ErrorBoundary"
import NavList from "../common/NavList"
import { INavLink } from "../types"
import ATSStatus from "./ATSStatus"
import { CompanyProfileStatus } from "./CompanyProfileStatus"
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

   const featureFlags = useFeatureFlags()

   const hasAccessToSparks =
      featureFlags.sparksAdminPageFlag || group.sparksAdminPageFlag

   const hasAtsIntegration =
      featureFlags.atsAdminPageFlag || group.atsAdminPageFlag

   const navLinks = useMemo(() => {
      // Declare hrefs here if you are using them in multiple places
      const companyPageHref = `/${BASE_HREF_PATH}/${group.id}/admin/page`

      const links: INavLink[] = [
         // 1. Dashboard - Keep current main page exactly as is
         {
            id: "dashboard",
            href: `/${BASE_HREF_PATH}/${group.id}/admin`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin`,
            Icon: HomeIcon,
            title: "Dashboard",
         },

         // 2. Content - Move live streams content with slight navigation adjustments
         {
            id: "content",
            title: "Content",
            Icon: ContentIcon,
            href: `/${BASE_HREF_PATH}/${group.id}/admin/events`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events`,
            childLinks: [
               {
                  id: "live-streams",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/events`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events`,
                  Icon: LiveStreamsIcon,
                  title: "Live streams",
               },
               {
                  id: "all-live-streams",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/events/all`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events/all/[[...livestreamDialog]]`,
                  Icon: AllLiveStreamsIcon,
                  title: "All live streams on CareerFairy",
               },
               // TODO: Add new page for non-Sparks customers (CF-1487, CF-1488)
               ...(hasAccessToSparks
                  ? [
                       {
                          id: "sparks",
                          href: `/${BASE_HREF_PATH}/${group.id}/admin/sparks`,
                          pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/sparks`,
                          Icon: SparksIcon,
                          title: "Sparks",
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
                          id: "sparks-analytics",
                          href: `/${BASE_HREF_PATH}/${group.id}/admin/sparks/analytics`,
                          pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/sparks/analytics`,
                          title: "Sparks analytics",
                       },
                    ]
                  : []),
            ],
         },

         // 3. Jobs - Keep job section exactly as is (recently reworked in job hub V2)
         ...(hasAtsIntegration
            ? []
            : [
                 {
                    id: "jobs",
                    href: `/${BASE_HREF_PATH}/${group.id}/admin/jobs`,
                    pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/jobs/[[...jobId]]`,
                    Icon: JobsIcon,
                    title: "Jobs",
                 },
              ]),

         // 4. Talent pool - Move existing analytics/talent-pool page to new section
         ...(group.universityCode // Hide talent pool for universities
            ? []
            : [
                 {
                    id: "talent-pool",
                    href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/talent-pool`,
                    pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/talent-pool`,
                    Icon: TalentPoolIcon,
                    title: "Talent pool",
                 },
              ]),

         // 5. Analytics - Adjust navigation between analytics tabs
         {
            id: "analytics",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics`,
            Icon: AnalyticsIcon,
            title: "Analytics",
            childLinks: [
               {
                  id: "general-analytics",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics`,
                  title: "General",
               },
               {
                  id: "live-stream-analytics",
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
               // TODO: Add new page for non-Sparks customers (CF-1489, CF-1490)
            ],
         },

         // 6. Company profile - Move existing company page with alert icon when publicProfile == false
         {
            id: "company-profile",
            title: "Company profile",
            Icon: CompanyProfileIcon,
            href: companyPageHref,
            pathname: companyPagePathName,
            rightElement: <CompanyProfileStatus group={group} />,
         },
      ]

      if (hasAtsIntegration) {
         // Insert ATS integration before Support
         links.splice(-1, 0, {
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
      group,
      hasAccessToSparks,
      showSparksUpgradeWarning,
      hasAtsIntegration,
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
