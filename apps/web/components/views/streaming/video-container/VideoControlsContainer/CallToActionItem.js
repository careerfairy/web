import React, { memo, useContext, useEffect, useMemo, useState } from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import Box from "@mui/material/Box"
import {
   Button,
   IconButton,
   ListItem,
   ListItemAvatar,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from "@mui/material"
import SettingsIcon from "@mui/icons-material/MoreVert"
import LinkifyText from "../../../../util/LinkifyText"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import ResendIcon from "@mui/icons-material/Repeat"
import {
   callToActionsDictionary,
   callToActionsSocialsDictionary,
} from "../../../../util/constants/callToActions"
import RubberBand from "@stahl.luke/react-reveal/RubberBand"
import { StyledTooltipWithButton } from "../../../../../materialUI/GlobalTooltips"
import TutorialContext from "../../../../../context/tutorials/TutorialContext"
import { getRandomInt } from "../../../../helperFunctions/HelperFunctions"

const useStyles = makeStyles(({ palette }) => ({
   root: {},
   detailsWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "50%",
   },
   headerActionsWrapper: {
      position: "relative",
      flexDirection: "column",
      width: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   listItemAvatar: {
      height: "100%",
      backgroundColor: (props) => alpha(props.color, 0.3),
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& svg": {
         fontSize: 40,
         color: palette.common.white,
      },
   },
   settingBtn: {
      position: "absolute",
      right: 0,
      top: 0,
   },
}))

const SettingsDropdown = ({
   className,
   callToAction,
   handleClickEditCallToAction,
   handleClickDeleteCallToAction,
   handleClickResendCallToAction,
   disabled,
}) => {
   const [anchorEl, setAnchorEl] = useState(null)

   const handleOpen = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   return (
      <React.Fragment>
         <IconButton onClick={handleOpen} size="small" className={className}>
            <SettingsIcon />
         </IconButton>
         <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
         >
            <MenuItem
               disabled={disabled}
               onClick={() => {
                  handleClickEditCallToAction(callToAction)
                  handleClose()
               }}
            >
               <ListItemIcon>
                  <EditIcon />
               </ListItemIcon>
               <Typography variant="inherit">Edit</Typography>
            </MenuItem>
            <MenuItem
               disabled={disabled}
               onClick={() => {
                  handleClickDeleteCallToAction(callToAction.id)
                  handleClose()
               }}
            >
               <ListItemIcon>
                  <DeleteIcon />
               </ListItemIcon>
               <Typography variant="inherit">Delete</Typography>
            </MenuItem>
            <MenuItem
               disabled={disabled}
               onClick={() => {
                  handleClickResendCallToAction(callToAction.id)
                  handleClose()
               }}
            >
               <ListItemIcon>
                  <ResendIcon />
               </ListItemIcon>
               <Typography variant="inherit">Resend</Typography>
            </MenuItem>
         </Menu>
      </React.Fragment>
   )
}

const EngagementChart = memo(({ percentage, noOfEngagement, total }) => {
   return (
      <Box position="relative" display="inline-flex">
         <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
         >
            <RubberBand spy={noOfEngagement}>
               <Typography variant="h6" component="div" color="textSecondary">
                  {noOfEngagement}
               </Typography>
            </RubberBand>
         </Box>
      </Box>
   )
})

EngagementChart.displayName = "EngagementChart"

const numberOfTicks = 20
let count = 0
export const CallToActionItem = React.memo((props) => {
   const {
      callToAction: {
         active,
         id,
         buttonUrl,
         created,
         message,
         numberOfUsersWhoClickedLink,
         numberOfUsersWhoDismissed,
         buttonText,
         type,
         jobData,
         socialData,
      },
      handleToggleActive,
      handleClickEditCallToAction,
      handleClickDeleteCallToAction,
      handleClickResendCallToAction,
      handleClose,
      setTutorialCtaId,
      tutorialCtaId,
   } = props

   const { handleConfirmStep, isOpen } = useContext(TutorialContext)
   const isTutorialCta = useMemo(
      () => isOpen(22) && tutorialCtaId === id,
      [tutorialCtaId, id, isOpen(22)]
   )

   const isJobPosting = type === "jobPosting"

   const [color, setColor] = useState(
      callToActionsDictionary[type]?.color ||
         callToActionsDictionary.custom.color
   )

   const classes = useStyles({ color })

   const [engagementData, setEngagementData] = useState({
      total: 0,
      percentage: 0,
      noOfEngagement: 0,
      noOfDismissal: 0,
   })

   const [icon, setIcon] = useState(callToActionsDictionary.custom.icon)

   useEffect(() => {
      if (
         numberOfUsersWhoClickedLink < 2 &&
         isTutorialCta &&
         count < numberOfTicks
      ) {
         const interval = setInterval(() => {
            count = count + 1
            if (count >= numberOfTicks) {
               clearInterval(interval)
            }
            simulateEngagement()
         }, 200)
         return () => clearInterval(interval)
      }
   }, [Boolean(numberOfUsersWhoClickedLink), isTutorialCta])

   const simulateEngagement = () => {
      setEngagementData({
         ...engagementData,
         noOfEngagement: (engagementData.noOfEngagement += getRandomInt(1, 3)),
      })
   }

   useEffect(() => {
      const noOfEngagement = numberOfUsersWhoClickedLink || 0
      const noOfDismissal = numberOfUsersWhoDismissed || 0
      const totalEngagement = Math.round(noOfDismissal + noOfEngagement)
      const percentage =
         Math.round((noOfEngagement / totalEngagement) * 100) || 0
      setEngagementData({
         total: totalEngagement,
         percentage: percentage,
         noOfEngagement: noOfEngagement,
         noOfDismissal: noOfDismissal,
      })
   }, [numberOfUsersWhoClickedLink, numberOfUsersWhoDismissed])

   useEffect(() => {
      ;(function handleSetIcon() {
         const isSocial = type === "social"
         let newIcon = callToActionsDictionary.custom.icon
         let newColor =
            callToActionsDictionary[type]?.color ||
            callToActionsDictionary.custom.color
         if (isSocial) {
            if (socialData.socialType) {
               newIcon =
                  callToActionsSocialsDictionary[socialData.socialType].icon
               newColor =
                  callToActionsSocialsDictionary[socialData.socialType].color
            }
         } else if (callToActionsDictionary[type]) {
            newIcon = callToActionsDictionary[type].icon
            newColor = callToActionsDictionary[type].color
         }
         setColor(newColor)
         setIcon(newIcon)
      })()
   }, [type, socialData])

   return (
      <StyledTooltipWithButton
         open={isTutorialCta}
         tooltipTitle="Share Job Posts (8/8)"
         placement="right"
         onConfirm={() => {
            handleClose()
            handleConfirmStep(22)
         }}
         tooltipText="Here you can see and track how many users have interacted with you job posting."
      >
         <ListItem
            divider
            style={{
               height: 200,
            }}
         >
            <ListItemAvatar className={classes.listItemAvatar}>
               {icon}
            </ListItemAvatar>
            <Box flexGrow={1} minWidth={0} p={1} pr={0}>
               <Box display={"flex"}>
                  <div className={classes.detailsWrapper}>
                     {isJobPosting ? (
                        <ListItemText
                           primary="Job Title"
                           secondaryTypographyProps={{
                              noWrap: true,
                           }}
                           secondary={jobData?.jobTitle}
                        />
                     ) : (
                        <ListItemText
                           primary="Button Text"
                           secondaryTypographyProps={{
                              noWrap: true,
                           }}
                           secondary={buttonText}
                        />
                     )}
                     <ListItemText
                        primary="Button Url"
                        secondaryTypographyProps={{
                           noWrap: true,
                        }}
                        secondary={<LinkifyText>{buttonUrl}</LinkifyText>}
                     />
                     <ListItemText
                        primary={isJobPosting ? "Job Description" : "Message"}
                        secondaryTypographyProps={{
                           noWrap: true,
                        }}
                        secondary={message}
                     />
                  </div>
                  <div className={classes.headerActionsWrapper}>
                     <SettingsDropdown
                        disabled={isTutorialCta}
                        handleClickEditCallToAction={
                           handleClickEditCallToAction
                        }
                        handleClickResendCallToAction={
                           handleClickResendCallToAction
                        }
                        handleClickDeleteCallToAction={
                           handleClickDeleteCallToAction
                        }
                        callToAction={props.callToAction}
                        className={classes.settingBtn}
                     />
                     <Typography gutterBottom color="textSecondary">
                        Clicks
                     </Typography>
                     <div>
                        <EngagementChart
                           noOfEngagement={engagementData.noOfEngagement}
                           percentage={engagementData.percentage}
                           total={engagementData.total}
                        />
                     </div>
                  </div>
               </Box>
               <Box>
                  <Button
                     color="primary"
                     fullWidth
                     disabled={isTutorialCta}
                     variant={active ? "contained" : "outlined"}
                     onClick={() => {
                        handleToggleActive(id, active)
                     }}
                  >
                     {active
                        ? "Deactivate Call To Action"
                        : "Send Call To Action"}
                  </Button>
               </Box>
            </Box>
         </ListItem>
      </StyledTooltipWithButton>
   )
})

CallToActionItem.displayName = "CallToActionItem"

export default CallToActionItem
