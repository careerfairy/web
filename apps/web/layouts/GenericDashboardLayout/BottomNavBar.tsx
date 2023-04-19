import { INavLink } from "../types"
import { Tab, Tabs } from "@mui/material"
import Link from "../../components/views/common/Link"
import Box from "@mui/material/Box"
import React from "react"
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
   },
   navLink: {
      display: "flex",
      flexDirection: "column",
      width: "25%",
      backgroundColor: "transparent !important",
      color: (theme) => alpha(theme.palette.text.secondary, 0.3),
      fontWeight: 500,
      fontSize: "10px",
      px: 0,
      py: 2,

      "&:hover , &:focus": {
         color: "text.primary",
      },
   },
   activeNavLink: {
      color: "text.primary",
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
         {links.map(({ id, href, Icon, title, mobileTitle, pathname }) => {
            const isActivePath = pathname === routerPathname

            return (
               <Tab
                  key={id}
                  icon={<Box component={Icon} />}
                  component={Link}
                  href={href}
                  label={isMobile ? mobileTitle || title : title}
                  sx={[styles.navLink, isActivePath && styles.activeNavLink]}
               />
            )
         })}
      </Tabs>
   )
}

export default BottomNavBar
