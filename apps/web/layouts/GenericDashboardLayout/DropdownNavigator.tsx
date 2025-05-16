import { Box, Tab, Tabs } from "@mui/material"
import { useNavLinks } from "hooks/useNavLinks"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { useGenericDashboard } from "."
import { sxStyles } from "../../types/commonTypes"
import { INavLink } from "../types"

const styles = sxStyles({
   tabsWrapper: {
      borderBottom: 1,
      borderColor: (theme) => theme.brand.black[400],
      mb: 2,
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
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      flex: "1 0 0",
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

const TabsNavigator = () => {
   const { isMobile, userCountryCode } = useGenericDashboard()
   const { pathname, push } = useRouter()

   const navLinks = useNavLinks(isMobile, userCountryCode)
   const [tabValue, setTabValue] = useState(pathname)
   const paths = useMemo((): INavLink[] => {
      const actualLink = navLinks.find((link) =>
         link?.childLinks?.some((childLink) => childLink.pathname === pathname)
      )
      return actualLink ? actualLink.childLinks : []
   }, [navLinks, pathname])

   const handleOptionClick = useCallback(
      (option: INavLink) => {
         setTabValue(option.pathname)
         void push(option.pathname)
      },
      [push]
   )

   if (paths?.length) {
      return (
         <>
            <Box sx={styles.tabsWrapper}>
               <Tabs value={tabValue} sx={styles.tabs}>
                  {paths.map((path) => {
                     return (
                        <Tab
                           key={path.id}
                           label={path.title}
                           value={path.pathname}
                           onClick={() => handleOptionClick(path)}
                           icon={
                              <Box
                                 component={path.Icon}
                                 sx={styles.icon}
                                 fill={
                                    tabValue == path.pathname
                                       ? "currentColor"
                                       : "none"
                                 }
                              />
                           }
                           sx={styles.tab}
                        />
                     )
                  })}
               </Tabs>
            </Box>
         </>
      )
   }

   return null
}

export default TabsNavigator
