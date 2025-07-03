import { useRouter } from "next/router"
import React, { useMemo } from "react"

// material-ui
import {
   Chip,
   List,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Link from "../../components/views/common/Link"

// project imports
import Collapse from "@mui/material/Collapse"
import { LevelsNewChip } from "layouts/GenericDashboardLayout/GenericNavList"
import { sxStyles } from "../../types/commonTypes"
import type { INavLink } from "../types"

const iconSize = 24
export const styles = sxStyles({
   icon: {
      width: iconSize,
      height: iconSize,
      color: "inherit",
      strokeWidth: 1.5,
   },
   navLink: {
      backgroundColor: "transparent !important",
      alignItems: "flex-start",
      py: 1.25,
      px: 1.5,
      borderRadius: "8px",
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 400,
      "&:hover , &:focus": {
         backgroundColor: (theme) => `${theme.brand.white[400]} !important`,
      },
   },
   navLinkMobile: {
      color: (theme) => theme.brand.black[700],
   },
   navLinkNested: {
      py: 1,
      pl: 5,
   },
   linkActive: {
      backgroundColor: (theme) => `${theme.brand.white[500]} !important`,
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
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
      px: 2,
   },
   label: {
      fontWeight: "inherit",
      fontSize: "inherit",
      color: "inherit",
      lineHeight: "20px",
   },
   newChip: (theme) => ({
      backgroundColor: theme.palette.error.main,
      border: `1px solid ${theme.brand.white[100]}`,
      height: "unset",
      "& .MuiChip-label": {
         padding: "0px 6px",
         fontWeight: 400,
         fontSize: "10px",
         lineHeight: "16px",
         color: theme.brand.white[100],
      },
   }),
})

type NavListProps = {
   links: INavLink[]
}
const NavList = ({ links }: NavListProps) => {
   return (
      <Box component={"nav"} sx={styles.list}>
         <Stack spacing={2} component={List}>
            {links.map((navItem) => (
               <NavLink key={navItem.id} {...navItem} />
            ))}
         </Stack>
      </Box>
   )
}

type NavLinkProps = INavLink & {
   baseTextColor?: string
   external?: boolean
   isNested?: boolean
   shrunk?: boolean
}
export const NavLink = ({
   href,
   Icon,
   title,
   pathname,
   childLinks,
   activePathPrefix,
   shrunk,
   external = false,
   baseTextColor,
   rightElement,
   isNested = false,
   wrapper,
}: NavLinkProps) => {
   const { pathname: routerPathname } = useRouter()

   const isNavLinkGroup = Boolean(childLinks?.length)

   const childLinkActive = useMemo(() => {
      if (!isNavLinkGroup) return false

      return childLinks.some((child) => child.pathname === routerPathname)
   }, [childLinks, isNavLinkGroup, routerPathname])

   const isActivePath =
      pathname === routerPathname ||
      (activePathPrefix && routerPathname.startsWith(activePathPrefix))

   const isOpen = childLinkActive || isActivePath

   const Wrapper = wrapper || React.Fragment

   return (
      <Wrapper>
         <span>
            <ListItemButton
               sx={[
                  styles.navLink,
                  isNested && styles.navLinkNested,
                  isActivePath && styles.linkActive,
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
                  <Box
                     sx={styles.icon}
                     component={Icon}
                     fill={isActivePath ? "currentColor" : "none"}
                  />
               </ListItemIcon>
               {shrunk ? null : (
                  <ListItemText
                     primary={
                        <Stack
                           direction={"row"}
                           alignItems={"center"}
                           spacing={0.75}
                        >
                           <Typography variant={"small"} sx={styles.label}>
                              {title}
                           </Typography>
                           {title == "Levels" ? (
                              <LevelsNewChip>
                                 <Chip
                                    label={"New"}
                                    size="small"
                                    sx={styles.newChip}
                                 />
                              </LevelsNewChip>
                           ) : null}
                        </Stack>
                     }
                  />
               )}
               <Box my="auto">{rightElement}</Box>
            </ListItemButton>
            {isNavLinkGroup && !shrunk ? (
               <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                     {childLinks?.map((link) => (
                        <NavLink key={link.id} isNested {...link} />
                     ))}
                  </List>
               </Collapse>
            ) : null}
         </span>
      </Wrapper>
   )
}

export default NavList
