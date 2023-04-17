import { INavLink } from "../types"
import { ListItemButton, Typography } from "@mui/material"
import Link from "../../components/views/common/Link"
import Box from "@mui/material/Box"
import React from "react"
import { useRouter } from "next/router"
import { sxStyles } from "../../types/commonTypes"
import { alpha } from "@mui/material/styles"
import useIsMobile from "../../components/custom-hook/useIsMobile"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      position: "fixed",
      justifyContent: "space-around",
      width: "100%",
      bottom: 0,
      left: 0,
      zIndex: 999,
      background: "white",
      borderTop: "1px solid #F3F3F3",
   },
   navLink: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
      alignItems: "center",
      width: "100%",
      textAlign: "center",
      backgroundColor: "transparent !important",
      color: (theme) => alpha(theme.palette.text.secondary, 0.3),
      fontWeight: 500,
      fontSize: { xs: "12px", md: "15px" },
      "&:hover , &:focus": {
         color: "text.primary",
      },
      px: 0,
      py: 2,
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
      <Box sx={styles.wrapper}>
         {links.map(({ id, href, Icon, title, mobileTitle, pathname }) => {
            const isActivePath = pathname === routerPathname

            return (
               <ListItemButton
                  key={id}
                  component={Link}
                  href={href}
                  selected={isActivePath}
                  disableRipple
                  sx={[styles.navLink, isActivePath && styles.activeNavLink]}
               >
                  <Box sx={{}} component={Icon} />

                  <Typography
                     variant={"body1"}
                     fontWeight={"inherit"}
                     fontSize={"inherit"}
                     color="inherit"
                     mt={1}
                  >
                     {isMobile ? mobileTitle || title : title}
                  </Typography>
               </ListItemButton>
            )
         })}
      </Box>
   )
}

export default BottomNavBar
