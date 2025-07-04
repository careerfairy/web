import { Box, Tab, Tabs } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useFeatureFlags } from "components/custom-hook/useFeatureFlags"
import Link from "components/views/common/Link"
import { useRouter } from "next/router"
import { Fragment, SyntheticEvent, useCallback, useMemo } from "react"
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

type ValidTabs = "analytics" | "content" | "settings"

type Props = {
   showSubNavigationFor: ValidTabs
}

export const SubNavigationTabs = ({ showSubNavigationFor }: Props) => {
   const { pathname, push } = useRouter()
   const { group } = useGroup()

   const featureFlags = useFeatureFlags()

   const hasAccessToSparks =
      featureFlags.sparksAdminPageFlag || group.sparksAdminPageFlag

   // Create navigation links based on showSubNavigationFor
   const currentSection = useMemo(() => {
      const BASE_HREF_PATH = "group"
      const BASE_PARAM = "[groupId]"

      const navigationLookup: Record<ValidTabs, INavLink> = {
         content: {
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
         analytics: {
            id: "analytics",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/live-streams/overview`,
            title: "Analytics",
            childLinks: [
               {
                  id: "live-stream-analytics",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics/live-streams/overview`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/analytics/live-streams/overview`,
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
         settings: {
            id: "settings",
            title: "Settings",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/settings/general`,
            childLinks: [
               {
                  id: "general-settings",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/settings/general`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/settings/general`,
                  title: "General",
               },
               {
                  id: "team-members",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/settings/team-members`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/settings/team-members`,
                  title: "Team members",
               },
            ],
         },
      } as const

      return navigationLookup[showSubNavigationFor]
   }, [group.id, hasAccessToSparks, showSubNavigationFor])

   // Determine which tab should be active based on current pathname
   const activeTab = useMemo(() => {
      if (!currentSection?.childLinks?.length) return null

      // First try to find exact pathname match
      const exactMatch = currentSection.childLinks.find(
         (tab) => tab.pathname === pathname
      )
      if (exactMatch) return exactMatch

      // Fallback to first tab
      return currentSection.childLinks[0]
   }, [currentSection, pathname])

   const handleTabChange = useCallback(
      (_: SyntheticEvent, newValue: string) => {
         const selectedTab = currentSection?.childLinks?.find(
            (tab) => tab.pathname === newValue
         )

         if (selectedTab) {
            void push(selectedTab.href)
         }
      },
      [push, currentSection]
   )

   // Only show sub-navigation if we have tabs and we're in a supported section
   if (!currentSection?.childLinks?.length) {
      return null
   }

   return (
      <Fragment>
         <StyledTabsWrapper>
            <StyledTabs
               textColor="secondary"
               indicatorColor="secondary"
               value={activeTab?.pathname || false}
               onChange={handleTabChange}
            >
               {currentSection?.childLinks?.map((tab) => {
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
      </Fragment>
   )
}
