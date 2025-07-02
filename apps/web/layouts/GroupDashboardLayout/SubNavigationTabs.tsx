import { Box, Tab, Tabs } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useFeatureFlags } from "components/custom-hook/useFeatureFlags"
import Link from "components/views/common/Link"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { INavLink } from "../types"
import { useGroup } from "./index"

const StyledTabsWrapper = styled(Box)(({ theme }) => ({
   borderBottom: `1px solid ${theme.palette.neutral[200]}`,
}))

const StyledTabs = styled(Tabs)({
   display: "flex",
   alignItems: "flex-start",
   alignSelf: "stretch",
   minHeight: 0,
   "& .Mui-selected": {
      fontWeight: 600,
   },
})

// @ts-expect-error - textTransform is not a valid prop for Tab, bug with styled()
const StyledTab = styled(Tab)<{ href: string }>(({ theme }) => ({
   padding: "8px 32px 12px",
   color: theme.palette.neutral[700],
   fontWeight: 400,
   fontSize: "16px",
   textTransform: "none !important",
}))

export const SubNavigationTabs = () => {
   const { pathname, push } = useRouter()
   const { group } = useGroup()

   const [tabValue, setTabValue] = useState(pathname)

   const featureFlags = useFeatureFlags()

   const hasAccessToSparks =
      featureFlags.sparksAdminPageFlag || group.sparksAdminPageFlag

   // Create navigation links similar to GroupNavList
   const navLinks = useMemo(() => {
      const BASE_HREF_PATH = "group"
      const BASE_PARAM = "[groupId]"

      const links: INavLink[] = [
         // Content section
         {
            id: "content",
            title: "Content",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/content/live-streams`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/content/live-streams`,
            childLinks: [
               {
                  id: "live-streams",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/content/live-streams`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/content/live-streams`,
                  title: "Live streams",
               },
               ...(hasAccessToSparks
                  ? [
                       {
                          id: "sparks",
                          href: `/${BASE_HREF_PATH}/${group.id}/admin/content/sparks`,
                          pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/content/sparks`,
                          title: "Sparks",
                       },
                    ]
                  : []),
            ],
         },
         // Analytics section
         {
            id: "analytics",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/live-stream`,
            title: "Analytics",
            childLinks: [
               {
                  id: "live-stream-analytics",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/live-stream/[[...livestreamId]]`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/live-stream/[[...livestreamId]]`,
                  title: "Live stream",
               },
               {
                  id: "sparks-analytics",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/sparks`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/sparks`,
                  title: "Sparks",
               },
            ],
         },
         // Settings section
         {
            id: "settings",
            title: "Settings",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/edit`,
            childLinks: [
               {
                  id: "general-settings",
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
            ],
         },
      ]

      return links
   }, [group.id, hasAccessToSparks])

   // Find the current section and its child links
   const currentSectionTabs = useMemo((): INavLink[] => {
      const currentSection = navLinks.find((link) =>
         link?.childLinks?.some((childLink) => childLink.pathname === pathname)
      )
      return currentSection?.childLinks || []
   }, [navLinks, pathname])

   const handleTabChange = useCallback(
      (event: React.SyntheticEvent, newValue: string) => {
         setTabValue(newValue)
         const selectedTab = currentSectionTabs.find(
            (tab) => tab.pathname === newValue
         )
         if (selectedTab) {
            void push(selectedTab.href)
         }
      },
      [push, currentSectionTabs]
   )

   // Only show sub-navigation if we have tabs and we're in a supported section
   if (currentSectionTabs.length === 0) {
      return null
   }

   return (
      <StyledTabsWrapper>
         <StyledTabs
            textColor="secondary"
            indicatorColor="secondary"
            value={tabValue}
            onChange={handleTabChange}
         >
            {currentSectionTabs.map((tab) => {
               return (
                  <StyledTab
                     LinkComponent={Link}
                     key={tab.id}
                     label={tab.title}
                     value={tab.pathname}
                     // @ts-expect-error - href is not a valid prop for Tab, bug with styled()
                     href={tab.href}
                     shallow
                  />
               )
            })}
         </StyledTabs>
      </StyledTabsWrapper>
   )
}
