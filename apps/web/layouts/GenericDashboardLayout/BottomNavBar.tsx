import { SxProps } from "@mui/material"
import Box from "@mui/material/Box"
import Tab, { tabClasses } from "@mui/material/Tab"
import Tabs, { tabsClasses } from "@mui/material/Tabs"
import { useRouter } from "next/router"
import { useMemo } from "react"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import Link from "../../components/views/common/Link"
import { combineStyles, sxStyles } from "../../types/commonTypes"
import { INavLink } from "../types"
import { LevelsNewChip } from "./GenericNavList"

const styles = sxStyles({
   wrapper: {
      position: "fixed",
      height: "67px",
      bottom: 0,
      width: "100%",
      left: 0,
      zIndex: (theme) => theme.zIndex.appBar,
      background: "white",
      borderTop: "1px solid #F3F3F3",
      justifyContent: "center",
      alignItems: "center",
      [`& .${tabsClasses.flexContainer}`]: {
         justifyContent: "space-evenly",
         alignItems: "center",
         width: "100%",
      },
      [`& .${tabsClasses.indicator}`]: {
         display: "none",
      },
      [`& .${tabClasses.selected}`]: {
         color: (theme) => `${theme.palette.neutral[800]} !important`,
      },
   },
   disableHighlight: {
      [`& .${tabClasses.selected}`]: {
         color: (theme) => `${theme.brand.black[700]} !important`,
      },
   },
   wrapperDark: {
      backgroundColor: "neutral.900",
      borderTop: "1px solid #313131",
      [`& .${tabClasses.selected}`]: {
         color: (theme) => `${theme.brand.white[500]} !important`,
      },
   },
   navLink: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minWidth: "74px",
      maxWidth: "20%",
      backgroundColor: "transparent !important",
      color: (theme) => theme.brand.black[700],
      p: 0,
   },
   icon: {
      "& .MuiSvgIcon-root": {
         fontSize: "24px",
      },
      mb: "4px !important",
   },
   iconLabel: {
      textTransform: "none",
      fontSize: "10px",
      display: "flex",
      height: "100%",
      alignItems: "center",
   },
})

type Props = {
   links: INavLink[]
   isDark?: boolean
   sx?: SxProps
   disableHighlight?: boolean
}

const BottomNavBar = ({
   links,
   isDark = false,
   sx,
   disableHighlight,
}: Props) => {
   const { pathname: routerPathname } = useRouter()
   const isMobile = useIsMobile()

   const activeTab = useMemo(() => {
      return links.findIndex(({ pathname, childLinks }) => {
         const isActivePath = pathname === routerPathname
         const childLinkActive = childLinks?.find(
            (childrenLink) => childrenLink.pathname === routerPathname
         )

         return isActivePath || childLinkActive
      })
   }, [links, routerPathname])

   return (
      <Tabs
         id="bottom-nav-bar"
         sx={combineStyles(
            styles.wrapper,
            isDark && styles.wrapperDark,
            disableHighlight && styles.disableHighlight,
            sx
         )}
         value={activeTab > -1 ? activeTab : false}
      >
         {links.map(({ id, href, Icon, title, mobileTitle }, index) => (
            <Tab
               key={id}
               icon={
                  id == "levels" ? (
                     <LevelsNewChip>
                        <Box sx={styles.icon}>
                           <Icon
                              fill={
                                 activeTab === index ? "currentColor" : "none"
                              }
                           />
                        </Box>
                     </LevelsNewChip>
                  ) : (
                     <Box sx={styles.icon}>
                        <Icon
                           fill={activeTab === index ? "currentColor" : "none"}
                        />
                     </Box>
                  )
               }
               component={Link}
               href={href}
               label={
                  <Box sx={styles.iconLabel}>
                     {isMobile ? mobileTitle || title : title}
                  </Box>
               }
               sx={styles.navLink}
               value={index}
               disableRipple
            />
         ))}
      </Tabs>
   )
}

export default BottomNavBar
