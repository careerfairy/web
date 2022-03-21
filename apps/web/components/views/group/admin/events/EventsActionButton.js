import React, { useState } from "react"
import PropTypes from "prop-types"
import clsx from "clsx"
import { Film as StreamIcon } from "react-feather"
import { useSnackbar } from "notistack"
import { emphasize } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import SpeedDial from "@mui/material/SpeedDial"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import SpeedDialAction from "@mui/material/SpeedDialAction"
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser"

import ShareIcon from "@mui/icons-material/Share"
import {
   copyStringToClipboard,
   getBaseUrl,
} from "../../../../helperFunctions/HelperFunctions"

const useStyles = makeStyles((theme) => ({
   root: {
      width: 72,
      height: 72,
      position: "absolute",
      top: 16,
      right: 16,
   },
   speedDial: {
      position: "absolute",
   },
   tooltip: {
      transition: "all 0.8s",
      transitionTimingFunction: theme.transitions.easeInOut,
      whiteSpace: "nowrap",
      boxShadow: theme.shadows[16],
   },
   dialButton: {},
   action: {
      margin: 8,
      color: theme.palette.common.white,
      backgroundColor: emphasize(theme.palette.primary.main, 0.12),
      "&:hover": {
         backgroundColor: emphasize(theme.palette.primary.main, 0.15),
      },
      transition: `${theme.transitions.create("transform", {
         duration: theme.transitions.duration.shorter,
      })}, opacity 0.8s`,
      opacity: 1,
   },
}))

const EventsActionButton = ({
   group,
   className,
   handleOpenNewStreamModal,
   isAdmin,
   ...rest
}) => {
   const { enqueueSnackbar } = useSnackbar()
   const [open, setOpen] = useState(true)
   const classes = useStyles({ open })

   const toggleOpen = () => {
      setOpen(!open)
   }

   const handleShareDraftLink = () => {
      let baseUrl = "https://careerfairy.io"
      if (window?.location?.origin) {
         baseUrl = window.location.origin
      }
      const groupId = group.id
      const targetPath = `${baseUrl}/draft-stream?careerCenterIds=${groupId}`
      copyStringToClipboard(targetPath)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "default",
         preventDuplicate: true,
      })
   }

   const handleOpenStudentView = () => {
      const baseUrl = getBaseUrl()
      const studentPage = `${baseUrl}/next-livestreams/${group.id}`
      window?.open?.(studentPage, "_blank")
   }

   const buttonOptions = [
      {
         name: "Generate a draft link for companies",
         onClick: () => handleShareDraftLink(),
         icon: <ShareIcon />,
      },
   ]

   if (isAdmin) {
      buttonOptions.unshift({
         name: "Draft a new stream",
         onClick: () => handleOpenNewStreamModal(),
         icon: <StreamIcon />,
      })
   }

   buttonOptions.push({
      name: "View your upcoming streams on the student page",
      onClick: () => handleOpenStudentView(),
      icon: <OpenInBrowserIcon />,
   })

   return (
      <div className={clsx(classes.root, className)} {...rest}>
         <SpeedDial
            ariaLabel="Stream actions"
            className={classes.speedDial}
            FabProps={{
               className: classes.dialButton,
               onClick: toggleOpen,
               color: "secondary",
            }}
            icon={<SpeedDialIcon />}
            direction="down"
            open={open}
         >
            {buttonOptions.map((action) => (
               <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  FabProps={{
                     size: "large",
                     color: "primary",
                  }}
                  tooltipTitle={action.name}
                  classes={{
                     staticTooltipLabel: classes.tooltip,
                     fab: classes.action,
                  }}
                  tooltipOpen
                  onClick={action.onClick}
                  title={action.name}
               />
            ))}
         </SpeedDial>
      </div>
   )
}

EventsActionButton.propTypes = {
   className: PropTypes.string,
}

export default EventsActionButton
