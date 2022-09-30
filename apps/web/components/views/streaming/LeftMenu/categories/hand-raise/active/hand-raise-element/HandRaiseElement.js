import PropTypes from "prop-types"
import React, { useContext, useState } from "react"
import {
   Box,
   Button,
   Chip,
   Divider,
   Grid,
   ListItem,
   ListItemText,
   Tooltip,
} from "@mui/material"
import TutorialContext from "context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { getTimeFromNow } from "../../../../../../../helperFunctions/HelperFunctions"
import clsx from "clsx"

const useStyles = makeStyles((theme) => ({
   root: {
      flexDirection: "column",
      alignItems: "flex-start",
      position: "relative",
      color: ({ backgroundColor }) =>
         backgroundColor && theme.palette.common.white,
      backgroundColor: ({ backgroundColor }) =>
         backgroundColor && alpha(backgroundColor, 0.7),
      "& .MuiListItemText-secondary": {
         color: ({ backgroundColor }) =>
            backgroundColor && alpha(theme.palette.common.white, 1),
      },
      "& button": {
         color: ({ backgroundColor }) =>
            backgroundColor && theme.palette.common.white,
         borderColor: ({ backgroundColor }) =>
            backgroundColor && alpha(theme.palette.common.white, 0.7),
      },
   },
   handRaiseListItemDivider: {},
   statusChip: {
      "& .MuiChip-label": {
         fontSize: "0.7rem",
      },
      backgroundColor: ({ color }) => color && theme.palette[color]?.main,
   },
   whiteChip: {
      borderColor: theme.palette.common.white,
      color: theme.palette.common.white,
   },
}))

const StatusChip = ({ label, color, backgroundColor }) => {
   const classes = useStyles({ color })
   return (
      <Chip
         className={clsx(classes.statusChip, {
            [classes.whiteChip]: backgroundColor,
         })}
         variant={color ? "default" : "outlined"}
         size="small"
         label={label}
      />
   )
}
const HandRaiseListItem = ({
   title,
   subtitle,
   primaryOnClick,
   primaryButtonText,
   primaryButtonDisabled,
   secondaryOnClick,
   secondaryButtonText,
   secondaryButtonDisabled,
   primaryDisabledMessage,
   backgroundColor,
   isNew,
   timestamp,
}) => {
   const classes = useStyles({ backgroundColor })
   return (
      <React.Fragment>
         <ListItem color="blue" className={classes.root}>
            <ListItemText
               primary={title}
               primaryTypographyProps={{
                  noWrap: true,
               }}
               secondaryTypographyProps={{
                  noWrap: true,
               }}
               secondary={subtitle}
            />
            {(isNew || timestamp) && (
               <Box position="absolute" right="0" top="0">
                  {isNew && (
                     <StatusChip
                        backgroundColor={backgroundColor}
                        color="warning"
                        label={"new"}
                     />
                  )}
                  {timestamp && (
                     <StatusChip
                        backgroundColor={backgroundColor}
                        label={getTimeFromNow(timestamp)}
                     />
                  )}
               </Box>
            )}
            <Grid container spacing={1}>
               {primaryOnClick && (
                  <Grid item>
                     <Tooltip
                        title={
                           primaryButtonDisabled && primaryDisabledMessage
                              ? primaryDisabledMessage
                              : ""
                        }
                     >
                        <span>
                           <Button
                              size="small"
                              onClick={primaryOnClick}
                              color="primary"
                              disabled={primaryButtonDisabled}
                              variant="outlined"
                           >
                              {primaryButtonText}
                           </Button>
                        </span>
                     </Tooltip>
                  </Grid>
               )}
               {secondaryOnClick && (
                  <Grid item>
                     <Button
                        size="small"
                        onClick={secondaryOnClick}
                        disabled={secondaryButtonDisabled}
                        variant="outlined"
                     >
                        {secondaryButtonText}
                     </Button>
                  </Grid>
               )}
            </Grid>
         </ListItem>
         <Divider className={classes.handRaiseListItemDivider} component="li" />
      </React.Fragment>
   )
}

HandRaiseListItem.propTypes = {
   backgroundColor: PropTypes.string,
   primaryButtonDisabled: PropTypes.bool,
   primaryButtonText: PropTypes.string,
   primaryDisabledMessage: PropTypes.string,
   primaryOnClick: PropTypes.func,
   secondaryButtonDisabled: PropTypes.bool,
   secondaryButtonText: PropTypes.string,
   secondaryOnClick: PropTypes.func,
   subtitle: PropTypes.string,
   title: PropTypes.string,
   isNew: PropTypes.bool,
   timestamp: PropTypes.object,
}
const getId = ({ request: { id, timestamp } }) => {
   return `${id}-${timestamp?.seconds || "new"}`
}

function RequestedHandRaiseElement(props) {
   const [notificationId] = useState(getId(props))
   const { getActiveTutorialStepKey, handleConfirmStep, isOpen } =
      useContext(TutorialContext)
   const activeStep = getActiveTutorialStepKey()

   function updateHandRaiseRequest(state) {
      props.updateHandRaiseRequest(props.request.id, state)
      props?.setNotificationToRemove?.(notificationId)
   }

   return (
      <WhiteTooltip
         placement="right-start"
         style={{ width: "100%" }}
         title={
            <React.Fragment>
               <TooltipTitle>Hand Raise (2/5)</TooltipTitle>
               <TooltipText>
                  All the viewers who request to join your stream appear here.
                  You can invite them in by clicking on the corresponding
                  button.
               </TooltipText>
               {activeStep === 10 && (
                  <TooltipButtonComponent
                     onConfirm={() => {
                        handleConfirmStep(10)
                        updateHandRaiseRequest("connected")
                     }}
                     buttonText="Ok"
                  />
               )}
            </React.Fragment>
         }
         open={Boolean(props.hasEntered && isOpen(10))}
      >
         <HandRaiseListItem
            timestamp={props.request.timestamp}
            primaryOnClick={() => {
               if (isOpen(10)) {
                  handleConfirmStep(10)
                  updateHandRaiseRequest("connected")
               } else {
                  updateHandRaiseRequest("invited")
               }
            }}
            primaryButtonText={"Invite to speak"}
            primaryButtonDisabled={!props.hasRoom}
            title={"HAND RAISED"}
            secondaryOnClick={() => updateHandRaiseRequest("denied")}
            secondaryButtonText={"Deny"}
            secondaryButtonDisabled={isOpen(10)}
            primaryDisabledMessage={`You cannot invite more than ${props.maxHandRaisers} people simultaneously in hand raise`}
            subtitle={props.request.name}
         />
      </WhiteTooltip>
   )
}

function InvitedHandRaiseElement(props) {
   const theme = useTheme()
   return (
      <HandRaiseListItem
         title={"INVITED"}
         timestamp={props.request.timestamp}
         backgroundColor={theme.palette.primary.main}
         secondaryOnClick={() =>
            props.updateHandRaiseRequest(props.request.id, "denied")
         }
         subtitle={props.request.name}
         secondaryButtonText={"Remove"}
      />
   )
}

function ConnectingHandRaiseElement(props) {
   const [notificationId] = useState(getId(props))

   function updateHandRaiseRequest(state) {
      props.updateHandRaiseRequest(props.request.id, state)
      props?.setNotificationToRemove(notificationId)
   }

   return (
      <HandRaiseListItem
         title={"CONNECTING"}
         timestamp={props.request.timestamp}
         secondaryOnClick={() => updateHandRaiseRequest("denied")}
         subtitle={props.request.name}
         secondaryButtonText={"Remove"}
      />
   )
}

function ConnectedHandRaiseElement(props) {
   const [notificationId] = useState(getId(props))
   const { getActiveTutorialStepKey, handleConfirmStep, isOpen } =
      useContext(TutorialContext)

   const activeStep = getActiveTutorialStepKey()

   function updateHandRaiseRequest(state) {
      props.updateHandRaiseRequest(props.request.id, state)
      props?.setNotificationToRemove(notificationId)
   }

   return (
      <WhiteTooltip
         placement="right"
         style={{ width: "100%" }}
         title={
            <React.Fragment>
               <TooltipTitle>Hand Raise (4/5)</TooltipTitle>
               <TooltipText>
                  At any time, you can remove a hand raiser by clicking on the
                  corresponding button.
               </TooltipText>
               {activeStep === 12 && (
                  <TooltipButtonComponent
                     onConfirm={() => {
                        handleConfirmStep(12)
                        updateHandRaiseRequest("denied")
                     }}
                     buttonText="Ok"
                  />
               )}
            </React.Fragment>
         }
         open={isOpen(12)}
      >
         <HandRaiseListItem
            title={"CONNECTED"}
            timestamp={props.request.timestamp}
            primaryOnClick={() => {
               if (isOpen(12)) {
                  handleConfirmStep(12)
               }
               updateHandRaiseRequest("denied")
            }}
            subtitle={props.request.name}
            primaryButtonText={"Remove"}
            primaryButtonDisabled={isOpen(11)}
         />
      </WhiteTooltip>
   )
}

function HandRaiseElement(props) {
   if (props.request.state === "requested") {
      return <RequestedHandRaiseElement {...props} />
   }
   if (props.request.state === "invited") {
      return <InvitedHandRaiseElement {...props} />
   }
   if (props.request.state === "connecting") {
      return <ConnectingHandRaiseElement {...props} />
   }
   if (props.request.state === "connected") {
      return <ConnectedHandRaiseElement {...props} />
   }

   return null
}

export default HandRaiseElement
