import { useMemo } from "react"

// react feather
import { BarChart2 as AnalyticsIcon, Sliders as ATSIcon } from "react-feather"

// material-ui
import Skeleton from "@mui/material/Skeleton"

// project imports
import {
   CompanyProfileIcon,
   ContentIcon,
   TalentPoolIcon,
} from "components/views/common/icons"
import { DashboardIcon } from "components/views/common/icons/DashboardIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
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
   const { group, shrunkLeftMenuIsActive } = useGroup()

   const featureFlags = useFeatureFlags()

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
            Icon: DashboardIcon,
            title: "Dashboard",
         },

         // 2. Content - Move live streams content with slight navigation adjustments
         {
            id: "content",
            title: "Content",
            Icon: ContentIcon,
            href: `/${BASE_HREF_PATH}/${group.id}/admin/events`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events`,
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
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics`,
            Icon: AnalyticsIcon,
            title: "Analytics",
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
   }, [group, hasAtsIntegration, shrunkLeftMenuIsActive])

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
