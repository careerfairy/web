import { INavLink } from "../types"
import { Tab, Tabs, Typography } from "@mui/material"
import Link from "../../components/views/common/Link"
import Box from "@mui/material/Box"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { sxStyles } from "../../types/commonTypes"
import { alpha } from "@mui/material/styles"
import useIsMobile from "../../components/custom-hook/useIsMobile"

const styles = sxStyles({
   wrapper: {
      position: "fixed",
      bottom: 0,
      width: "100%",
      left: 0,
      zIndex: 999,
      background: "white",
      borderTop: "1px solid #F3F3F3",
      " .MuiTabs-flexContainer": {
         justifyContent: "space-evenly",
      },
   },
   navLink: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      minWidth: 0,
      maxWidth: "20%",
      backgroundColor: "transparent !important",
      color: (theme) => alpha(theme.palette.text.secondary, 0.3),
      px: "0px",
      py: "12px",
      "&:hover , &:focus": {
         color: "text.primary",
      },
   },
   activeNavLink: {
      color: "text.primary",
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
   links: INavLink[]
}

const BottomNavBar = ({ links }: Props) => {
   const { pathname: routerPathname } = useRouter()
   const isMobile = useIsMobile()

   return (
      <Tabs
         sx={styles.wrapper}
         TabIndicatorProps={{ sx: { justifyContent: "space-around" } } as any}
      >
         {links.map(
            ({ id, href, Icon, title, mobileTitle, pathname, childLinks }) => {
               const isActivePath = pathname === routerPathname
               const isChildrenActive = childLinks?.find(
                  (childrenLink: INavLink) =>
                     childrenLink.pathname === routerPathname
               )

               return (
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
                     sx={[
                        styles.navLink,
                        (isActivePath || isChildrenActive) &&
                           styles.activeNavLink,
                     ]}
                  />
               )
            }
         )}
      </Tabs>
   )
}

export default BottomNavBar
