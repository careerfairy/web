import React from "react"
import PropTypes from "prop-types"
import { Box, Button, ListItem } from "@mui/material"
import { useRouter } from "next/router"
import Link from "../../../materialUI/NextNavLink"

const NavItem = ({
   className = undefined,
   basePath = undefined,
   black,
   href,
   icon: Icon,
   title,
   svgIcon = undefined,
   onClick = undefined,
   ...rest
}) => {
   const { pathname } = useRouter()

   return (
      <ListItem
         className={className}
         sx={{
            display: "flex",
            paddingTop: 0,
            paddingBottom: 0,
         }}
         disableGutters
         {...rest}
      >
         <Button
            href={onClick ? undefined : href}
            onClick={onClick}
            component={onClick ? "button" : Link}
            startIcon={
               svgIcon ? <div>{svgIcon}</div> : Icon && <Icon size="20" />
            }
            sx={(theme) => ({
               color: black
                  ? theme.palette.text.secondary
                  : theme.palette.common.white,
               fontWeight: theme.typography.fontWeightLight,
               justifyContent: "flex-start",
               letterSpacing: 0,
               padding: "10px 8px",
               textTransform: "none",
               width: "100%",
               textDecoration: "none !important",
               "&:hover": {
                  color: black
                     ? theme.palette.text.secondary
                     : theme.palette.common.white,
               },
               "&.active": {
                  background: theme.palette.common.white,
                  color: theme.palette.text.secondary,
                  // color: theme.palette.primary.main,
                  boxShadow: theme.whiteShadow,
                  "& $title": {
                     fontWeight: theme.typography.fontWeightMedium,
                  },
                  "& $icon": {
                     // color: theme.palette.primary.main
                  },
               },
            })}
            className={basePath === pathname ? "active" : ""}
         >
            <Box
               component="span"
               sx={{
                  marginRight: "auto",
               }}
            >
               {title}
            </Box>
         </Button>
      </ListItem>
   )
}

NavItem.propTypes = {
   className: PropTypes.string,
   href: PropTypes.string,
   icon: PropTypes.elementType,
   title: PropTypes.string,
}

export default NavItem
