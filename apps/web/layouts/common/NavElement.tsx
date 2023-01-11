// import React, { useCallback, useEffect, useState } from "react"
// import type { INavLink } from "../../types/layout"
// import { INavGroup } from "../../types/layout"
// import { useRouter } from "next/router"
// import {
//    List,
//    ListItemButton,
//    ListItemIcon,
//    ListItemText,
//    Typography,
// } from "@mui/material"
// import Link from "../../components/views/common/Link"
// import Collapse from "@mui/material/Collapse"
// import Box from "@mui/material/Box"
// import { sxStyles } from "../../types/commonTypes"
// import { alpha } from "@mui/material/styles"
//
// const styles = sxStyles({
//    icon: {
//       fontSize: 24,
//    },
//    navElement: {
//       backgroundColor: "transparent !important",
//       mb: 0.5,
//       alignItems: "flex-start",
//       py: 1.25,
//       pl: "24px",
//       color: (theme) => alpha(theme.palette.text.secondary, 0.3),
//       fontWeight: "bold",
//       fontSize: "15px",
//    },
//    navElementActive: {
//       color: "text.primary",
//    },
//    navLink: {},
//    navLinkNested: {
//       py: 1,
//       pl: "48px",
//    },
//    bordered: {
//       borderRight: (theme) => `5px solid ${theme.palette.primary.main}`,
//    },
//    iconWrapper: {
//       my: "auto",
//       minWidth: 36,
//       color: "inherit",
//    },
//    iconWrapperEmpty: {
//       minWidth: 18,
//    },
// })
// export type NavGroupProps = {
//    item: INavGroup
// }
//
// export const NavGroup = ({ item }: NavGroupProps) => {
//    const { pathname } = useRouter()
//
//    const isNavGroupOpen = useCallback(
//       (item: INavGroup) => {
//          return item.children.some((child) => child.pathName === pathname)
//       },
//       [pathname]
//    )
//
//    const [isOpen, setIsOpen] = useState(isNavGroupOpen(item))
//
//    useEffect(() => {
//       setIsOpen(isNavGroupOpen(item))
//    }, [isNavGroupOpen, pathname, item])
//
//    const handleClick = () => setIsOpen(!isOpen)
//
//    return (
//       <span>
//          <ListItemButton
//             sx={[styles.navElement, isOpen && styles.navElementActive]}
//             selected={isOpen}
//             onClick={handleClick}
//             disableRipple
//          >
//             <ListItemIcon
//                sx={[styles.iconWrapper, !item.Icon && styles.iconWrapperEmpty]}
//             >
//                <Box
//                   sx={styles.icon}
//                   strokeWidth={2}
//                   fontWeight={"inherit"}
//                   fontSize={"inherit"}
//                   component={item.Icon}
//                />
//             </ListItemIcon>
//             <ListItemText
//                primary={
//                   <Typography
//                      fontWeight={"inherit"}
//                      fontSize={"inherit"}
//                      color="inherit"
//                   >
//                      {item.title}
//                   </Typography>
//                }
//             />
//          </ListItemButton>
//          <Collapse in={isOpen} timeout="auto" unmountOnExit>
//             <List component="div" disablePadding>
//                {item.children?.map((item) => (
//                   <NavLink
//                      key={item.id}
//                      item={item}
//                      isActive={pathname === item.pathName}
//                      isNested
//                   />
//                ))}
//             </List>
//          </Collapse>
//       </span>
//    )
// }
//
// type NavItemProps = {
//    isActive: boolean
//    item: INavLink
//    isNested?: boolean
// }
// export const NavLink = ({
//    isActive,
//    item: { href, Icon, title },
//    isNested = false,
// }: NavItemProps) => {
//    return (
//       <ListItemButton
//          sx={[
//             styles.navElement,
//             isActive && styles.bordered,
//             isNested && styles.navLinkNested,
//             isActive && styles.navElementActive,
//          ]}
//          component={Link}
//          href={href}
//          selected={isActive}
//          disableRipple
//       >
//          <ListItemIcon
//             sx={[styles.iconWrapper, !Icon && styles.iconWrapperEmpty]}
//          >
//             <Box sx={styles.icon} component={Icon} />
//          </ListItemIcon>
//          <ListItemText
//             primary={
//                <Typography
//                   variant={"body1"}
//                   fontWeight={"inherit"}
//                   fontSize={"inherit"}
//                   color="inherit"
//                >
//                   {title}
//                </Typography>
//             }
//          />
//       </ListItemButton>
//    )
// }
