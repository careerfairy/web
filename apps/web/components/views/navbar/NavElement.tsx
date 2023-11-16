import React, { FunctionComponent } from "react"
import Box from "@mui/material/Box"
import {
   IconProps,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import { Icon } from "react-feather"
import { StylesProps } from "../../../types/commonTypes"
import Link from "../common/Link"
import { useRouter } from "next/router"
import { alpha } from "@mui/material/styles"
import { PageLinkProps } from "../../custom-hook/useGeneralLinks"

interface NavElementProps {
   href: string
   title: string
   icon?: FunctionComponent<IconProps> | Icon | PageLinkProps["icon"]
   svgIcon?: SVGElement
   basePath?: string
   onClick?: () => void
}

const styles: StylesProps = {
   active: {
      backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
      color: "secondary.main",
      "& svg": {
         color: "secondary.main",
      },
   },
   hovered: {
      backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
      "&:after": {
         content: '""',
         width: "100%",
         height: "100%",
         position: "absolute",
         background: "inherit",
         backgroundPosition: "center center",
         filter: "drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.10)) blur(15px)",
         zIndex: -1,
      },
   },
   button: {
      position: "relative",
      transition: (theme) => theme.transitions.create("background-color"),
      color: "black",
      "& svg": {
         color: "black",
      },
      textTransform: "none",
      fontWeight: "bold",
      fontSize: "1rem",
      borderRadius: 5,
      "&:after": {
         transition: (theme) => theme.transitions.create(["filter"]),
      },
   },
}

const NavElement = ({
   href,
   basePath,
   title,
   icon: Icon,
   svgIcon,
   onClick,
}: NavElementProps) => {
   const { pathname } = useRouter()
   const isActive = pathname === basePath
   return (
      <ListItem disableGutters>
         <ListItemButton
            href={onClick ? undefined : href}
            onClick={onClick}
            component={onClick ? "button" : Link}
            sx={[
               styles.button,
               isActive && styles.active,
               { "&:hover , &:focus": { ...styles.active, ...styles.hovered } },
            ]}
         >
            {(svgIcon || Icon) && (
               <ListItemIcon color={"inherit"}>
                  {svgIcon ? (
                     <Box sx={styles.icon}>
                        {/* @ts-ignore */}
                        {svgIcon}
                     </Box>
                  ) : (
                     // @ts-ignore
                     Icon && <Box component={Icon} sx={styles.icon} size="20" />
                  )}
               </ListItemIcon>
            )}
            <ListItemText primary={title} />
         </ListItemButton>
      </ListItem>
   )
}

export default NavElement
