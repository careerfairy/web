import { Box, Tab, Tabs } from "@mui/material"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "../../types/commonTypes"
import { INavLink } from "../types"
import { useGroup } from "./index"

const styles = sxStyles({
   tabsWrapper: {
      borderBottom: 1,
      borderColor: (theme) => theme.brand.black[400],
      mb: 3,
      backgroundColor: "white",
   },
   tabs: {
      display: "flex",
      alignItems: "flex-start",
      alignSelf: "stretch",
      minHeight: 0,
      ".Mui-selected": {
         fontWeight: 600,
      },
   },
   tab: {
      display: "flex",
      flexDirection: "row",
      padding: "12px 24px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      color: (theme) => theme.palette.neutral[500],
      minHeight: 0,
      textTransform: "none !important",
      fontWeight: 400,
      fontSize: "16px",
   },
   icon: {
      width: "20px",
      height: "20px",
      mb: "0 !important",
   },
})

// Define which sections should show sub-navigation
// const SECTIONS_WITH_SUB_NAV = ["content", "settings", "analytics"]

const SubNavigationTabs = () => {
   const { pathname, push } = useRouter()
   const { group } = useGroup()

   const [tabValue, setTabValue] = useState(pathname)

   // Create navigation links similar to GroupNavList
   const navLinks = useMemo(() => {
      const BASE_HREF_PATH = "group"
      const BASE_PARAM = "[groupId]"

      const links: INavLink[] = [
         // Content section
         {
            id: "content",
            title: "Content",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/events`,
            pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events`,
            childLinks: [
               {
                  id: "live-streams",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/events`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events`,
                  title: "Live streams",
               },
               {
                  id: "all-live-streams",
                  href: `/${BASE_HREF_PATH}/${group.id}/admin/events/all`,
                  pathname: `/${BASE_HREF_PATH}/${BASE_PARAM}/admin/events/all/[[...livestreamDialog]]`,
                  title: "All live streams on CareerFairy",
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
         // Analytics section
         {
            id: "analytics",
            href: `/${BASE_HREF_PATH}/${group.id}/admin/analytics`,
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
            ],
         },
      ]

      return links
   }, [group.id])

   // Find the current section and its child links
   const currentSectionTabs = useMemo((): INavLink[] => {
      const currentSection = navLinks.find((link) =>
         link?.childLinks?.some((childLink) => childLink.pathname === pathname)
      )
      return currentSection?.childLinks || []
   }, [navLinks, pathname])

   const handleTabClick = useCallback(
      (option: INavLink) => {
         setTabValue(option.pathname)
         void push(option.href)
      },
      [push]
   )

   // Only show sub-navigation if we have tabs and we're in a supported section
   if (currentSectionTabs.length === 0) {
      return null
   }

   return (
      <Box sx={styles.tabsWrapper}>
         <Tabs value={tabValue} sx={styles.tabs}>
            {currentSectionTabs.map((tab) => {
               return (
                  <Tab
                     key={tab.id}
                     label={tab.title}
                     value={tab.pathname}
                     onClick={() => handleTabClick(tab)}
                     sx={styles.tab}
                  />
               )
            })}
         </Tabs>
      </Box>
   )
}

export default SubNavigationTabs
