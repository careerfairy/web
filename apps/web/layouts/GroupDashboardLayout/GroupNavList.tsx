import {
   CompanyProfileIcon,
   ContentIcon,
   TalentPoolIcon,
} from "components/views/common/icons"
import { AnalyticsIcon } from "components/views/common/icons/AnalyticsIcon"
import { DashboardIcon } from "components/views/common/icons/DashboardIcon"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import { useMemo } from "react"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import NavList from "../common/NavList"
import { INavLink } from "../types"
import { CompanyProfileStatus } from "./CompanyProfileStatus"
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"
import { useGroup } from "./index"

const BASE_HREF_PATH = "group"
const BASE_PARAM = "[groupId]"

type Props = {
   allowedLinkIds?: string[]
}

export const GroupNavList = ({ allowedLinkIds }: Props = {}) => {
   const { group, shrunkLeftMenuIsActive } = useGroup()
   const { setMobileFullScreenMenu } = useGroupDashboard()
   const isMobile = useIsMobile()

   const hasAtsIntegration = false

   const handleMobileNavigate = () => {
      if (isMobile) {
         setMobileFullScreenMenu(false)
      }
   }

   const navLinks = useMemo(() => {
      // Declare hrefs here if you are using them in multiple places

      const links: INavLink[] = [
         // 1. Dashboard - Keep current main page exactly as is
         {
            id: "dashboard",
            href: `/${BASE_HREF_PATH}/${group.id}/admin`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin`,
            Icon: DashboardIcon,
            title: "Dashboard",
            shallow: true,
         },

         // 2. Content - Move live streams content with slight navigation adjustments
         {
            id: "content",
            title: "Content",
            Icon: ContentIcon,
            href: `/${BASE_HREF_PATH}/${group.id}/admin/content/live-streams`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/content/live-streams`,
            activePathPrefix: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/content`,
            shallow: true,
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
                    shallow: true,
                 },
              ]),

         // 4. Talent pool - Move existing analytics/talent-pool page to new section
         ...(group.universityCode // Hide talent pool for universities
            ? []
            : [
                 {
                    id: "talent-pool",
                    href: `/${BASE_HREF_PATH}/${group.id}/admin/talent-pool`,
                    pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/talent-pool`,
                    Icon: TalentPoolIcon,
                    title: "Talent pool",
                    shallow: true,
                 },
              ]),

         // 5. Analytics - Adjust navigation between analytics tabs
         {
            id: "analytics",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/live-streams/overview`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/live-streams/overview`,
            Icon: AnalyticsIcon,
            title: "Analytics",
            activePathPrefix: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics`,
            shallow: true,
         },

         // 6. Company profile - Move existing company page with alert icon when publicProfile == false
         {
            id: "company-profile",
            title: "Company profile",
            Icon: CompanyProfileIcon,
            href: `/${BASE_HREF_PATH}/${group.id}/admin/page`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/page/[[...livestreamDialog]]`,
            rightElement: <CompanyProfileStatus group={group} />,
            shallow: true,
         },
      ]

      let filteredLinks = links

      // Filter links if allowedLinkIds is provided
      if (allowedLinkIds && allowedLinkIds.length > 0) {
         filteredLinks = links.filter((link) =>
            allowedLinkIds.includes(link.id)
         )
      }

      return filteredLinks.map((link) => ({
         ...link,
         shrunk: shrunkLeftMenuIsActive,
      }))
   }, [group, hasAtsIntegration, shrunkLeftMenuIsActive, allowedLinkIds])

   return (
      <NavList
         disablePadding
         links={navLinks}
         onMobileNavigate={handleMobileNavigate}
      />
   )
}
