import React from "react"
import { useRouter } from "next/router"

// material-ui
import {
   List,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import Link from "../../components/views/common/Link"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"

// project imports
import { sxStyles } from "../../types/commonTypes"
import type { INavLink } from "../types"

const styles = sxStyles({
   icon: {
      fontSize: 24,
   },
   navLink: {
      backgroundColor: "transparent !important",
      mb: 0.5,
      alignItems: "flex-start",
      py: 0.5,
      pl: "24px",
      color: (theme) => alpha(theme.palette.text.secondary, 0.3),
      fontWeight: 500,
      fontSize: "15px",
      px: 5,
      transition: (theme) =>
         theme.transitions.create(["color", "border-right"]),
      "&:hover": {
         color: "text.primary",
      },
   },
   navLinkActive: {
      color: "text.primary",
      borderRight: (theme) => `5px solid ${theme.palette.primary.main}`,
   },
   iconWrapper: {
      my: "auto",
      minWidth: 36,
      color: "inherit",
   },
   iconWrapperEmpty: {
      minWidth: 18,
   },
   list: {
      width: "100%",
   },
})

type NavListProps = {
   links: INavLink[]
}
const NavList = ({ links }: NavListProps) => {
   const { pathname } = useRouter()

   return (
      <Stack sx={styles.list} spacing={3} component={List}>
         {links.map((navItem) => (
            <NavLink
               isActive={pathname === navItem.pathname}
               key={navItem.id}
               {...navItem}
            />
         ))}
      </Stack>
   )
}

type NavLinkProps = INavLink & {
   isActive?: boolean
   baseTextColor?: string
   external?: boolean
}
export const NavLink = ({
   isActive,
   href,
   Icon,
   title,
   baseTextColor,
   external,
}: NavLinkProps) => {
   return (
      <ListItemButton
         sx={[
            styles.navLink,
            isActive && styles.navLinkActive,
            baseTextColor && { color: baseTextColor },
         ]}
         target={external ? "_blank" : undefined}
         component={Link}
         href={href}
         selected={isActive}
         disableRipple
      >
         <ListItemIcon
            sx={[styles.iconWrapper, !Icon && styles.iconWrapperEmpty]}
         >
            <Box sx={styles.icon} component={Icon} />
         </ListItemIcon>
         <ListItemText
            primary={
               <Typography
                  variant={"body1"}
                  fontWeight={"inherit"}
                  fontSize={"inherit"}
                  color="inherit"
               >
                  {title}
               </Typography>
            }
         />
      </ListItemButton>
   )
}

export default NavList
