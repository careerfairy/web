import React from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
import { Button, ListItem } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { useRouter } from "next/router"
import Link from "../../../materialUI/NextNavLink"

const useStyles = makeStyles((theme) => ({
   item: {
      display: "flex",
      paddingTop: 0,
      paddingBottom: 0,
   },
   button: {
      color: theme.palette.common.white,
      fontWeight: theme.typography.fontWeightLight,
      justifyContent: "flex-start",
      letterSpacing: 0,
      padding: "10px 8px",
      textTransform: "none",
      width: "100%",
      textDecoration: "none !important",
      "&:hover": {
         color: theme.palette.common.white,
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
   },
   icon: {
      marginRight: theme.spacing(1),
   },
   title: {
      marginRight: "auto",
   },
}))

const NavItem = ({
   className,
   basePath,
   href,
   icon: Icon,
   title,
   svgIcon,
   onClick,
   ...rest
}) => {
   const classes = useStyles()
   const { pathname } = useRouter()

   return (
      <ListItem
         className={clsx(classes.item, className)}
         disableGutters
         {...rest}
      >
         <Button
            href={onClick ? undefined : href}
            onClick={onClick}
            component={onClick ? "button" : Link}
            className={clsx(classes.button, {
               ["active"]: basePath === pathname,
            })}
         >
            {svgIcon ? (
               <div className={classes.icon}>{svgIcon}</div>
            ) : (
               Icon && <Icon className={classes.icon} size="20" />
            )}
            <span className={classes.title}>{title}</span>
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
