import React, { FunctionComponent } from "react"
import Box from "@mui/material/Box"
import {
   Button,
   IconProps,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import { Icon } from "react-feather"
import { StylesProps } from "../../../types/commonTypes"
import clsx from "clsx"
import Link from "../common/Link"
import { useRouter } from "next/router"
import { alpha } from "@mui/material/styles"

interface NavElementProps {
   href: string
   title: string
   icon?: FunctionComponent<IconProps> | Icon
   svgIcon?: SVGElement
   basePath?: string
   onClick?: () => void
}

const styles: StylesProps = {
   active: {
      backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
      "& svg": {
         color: "secondary.main",
      },
   },
   button: {
      transition: (theme) => theme.transitions.create("background-color"),
      color: "text.primary",
      textTransform: "none",
      fontWeight: "bold",
      fontSize: "1rem",
      borderRadius: 5,
      "&:hover": {
         backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
         color: "secondary.main",
         "& svg": {
            color: "secondary.main",
         },
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
            sx={[styles.button, isActive && styles.active]}
         >
            {(svgIcon || Icon) && (
               <ListItemIcon>
                  {svgIcon ? (
                     <Box sx={styles.icon}>{svgIcon}</Box>
                  ) : (
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
