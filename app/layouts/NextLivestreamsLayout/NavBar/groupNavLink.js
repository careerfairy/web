import ListItem from "@mui/material/ListItem"
import Link from "../../../materialUI/NextNavLink"
import clsx from "clsx"
import { Avatar, ListItemAvatar, Tooltip } from "@mui/material"
import ListItemText from "@mui/material/ListItemText"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import * as PropTypes from "prop-types"

const useStyles = makeStyles((theme) => ({
   logoButton: {
      padding: theme.spacing(1),
      color: "inherit",
      "&:hover": {
         textDecoration: "none",
      },
   },
   active: {
      position: "sticky",
      top: theme.spacing(2),
      background: `${theme.palette.background.paper} !important`,
      zIndex: 1,
      boxShadow: theme.shadows[3],
      borderRadius: theme.spacing(1),
      cursor: "default",
   },
   groupAvaWrapper: {
      "& img": {
         objectFit: "contain",
      },
   },
}))

const GroupNavLink = (props) => {
   const classes = useStyles()

   return (
      <ListItem
         component={Link}
         href={`/next-livestreams/${props.groupId}`}
         button
         divider
         onClick={props.onClick}
         className={clsx(classes.logoButton, {
            [classes.active]: props.groupIdInQuery === props.groupId,
         })}
      >
         <ListItemAvatar>
            <Avatar
               className={classes.groupAvaWrapper}
               alt={props.alt}
               variant="rounded"
               src={props.src}
            />
         </ListItemAvatar>
         <Tooltip title={props.alt}>
            <ListItemText
               primary={props.alt}
               primaryTypographyProps={{ noWrap: true }}
            />
         </Tooltip>
      </ListItem>
   )
}

GroupNavLink.propTypes = {
   groupId: PropTypes.string,
   onClick: PropTypes.func,
   classes: PropTypes.object,
   groupIdInQuery: PropTypes.string,
   alt: PropTypes.string,
   src: PropTypes.string,
}

export default GroupNavLink
