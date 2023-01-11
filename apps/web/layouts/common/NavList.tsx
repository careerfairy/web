import React, { useCallback, useEffect, useMemo, useState } from "react"
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
import Collapse from "@mui/material/Collapse"

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
   navLinkNested: {
      py: 1,
      pl: "48px",
   },
   textActive: {
      color: "text.primary",
   },
   borderActive: {
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
   return (
      <Stack sx={styles.list} spacing={3} component={List}>
         {links.map((navItem) => (
            <NavLink key={navItem.id} {...navItem} />
         ))}
      </Stack>
   )
}

type NavLinkProps = INavLink & {
   baseTextColor?: string
   external?: boolean
   isNested?: boolean
}
export const NavLink = ({
   href,
   Icon,
   title,
   pathname,
   childLinks,
   external = false,
   baseTextColor,
   isNested = false,
}: NavLinkProps) => {
   const { pathname: routerPathname } = useRouter()

   const isNavLinkGroup = Boolean(childLinks?.length)

   const childLinkActive = useMemo(() => {
      if (!isNavLinkGroup) return false

      return childLinks.some((child) => child.pathname === pathname)
   }, [childLinks, isNavLinkGroup, pathname])

   const isActivePath = pathname === routerPathname

   const isOpen = childLinkActive || isActivePath

   const isTextActive = isOpen || isActivePath

   return (
      <span>
         <ListItemButton
            sx={[
               styles.navLink,
               isNested && styles.navLinkNested,
               isTextActive && styles.textActive,
               isActivePath && styles.borderActive,
               baseTextColor && { color: baseTextColor },
            ]}
            target={external ? "_blank" : undefined}
            component={Link}
            href={href}
            selected={isActivePath}
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
         {isNavLinkGroup && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
               <List component="div" disablePadding>
                  {childLinks?.map((link) => (
                     <NavLink key={link.id} isNested {...link} />
                  ))}
               </List>
            </Collapse>
         )}
      </span>
   )
}

export default NavList
