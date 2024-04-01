import Box from "@mui/material/Box"
import Tab, { tabClasses } from "@mui/material/Tab"
import Tabs, { tabsClasses } from "@mui/material/Tabs"
import { alpha } from "@mui/material/styles"
import { useRouter } from "next/router"
import { useMemo } from "react"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import Link from "../../components/views/common/Link"
import { sxStyles } from "../../types/commonTypes"
import { INavLink } from "../types"

const styles = sxStyles({
   wrapper: {
      position: "fixed",
      height: "67px",
      bottom: 0,
      width: "100%",
      left: 0,
      zIndex: (theme) => theme.zIndex.modal,
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
         color: (theme) => `${theme.palette.text.primary} !important`,
      },
   },
   wrapperDark: {
      backgroundColor: "neutral.800",
      borderTop: "1px solid #313131",
      [`& .${tabClasses.root}`]: {
         color: (theme) => `${theme.brand.white[50]} !important`,
         opacity: 0.4
      },
      [`& .${tabClasses.selected}`]: {
         opacity: 1
      },
      [`& a:hover`]: {
         opacity: 1
      },
   },
   navLink: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minWidth: 0,
      maxWidth: "20%",
      backgroundColor: "transparent !important",
      color: (theme) => alpha(theme.palette.text.secondary, 0.3),
      p: 0,
      "&:hover , &:focus": {
         color: "text.primary",
      },
   },
   icon: {
      "& .MuiSvgIcon-root": {
         fontSize: "24px",
      },
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
   links: INavLink[],
   isDark?: boolean 
}

const BottomNavBar = ({ links, isDark = false }: Props) => {
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
      <Tabs sx={[styles.wrapper, isDark && styles.wrapperDark]} value={activeTab}>
         {links.map(({ id, href, Icon, title, mobileTitle }, index) => (
            <Tab
               key={id}
               icon={
                  <Box sx={styles.icon}>
                     <Icon />
                  </Box>
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
