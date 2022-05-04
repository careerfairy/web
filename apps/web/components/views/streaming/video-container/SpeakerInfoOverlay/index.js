import React, { memo, useCallback } from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import PropTypes from "prop-types"
import {
   Button,
   CardActions,
   CardHeader,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   Popover,
   Tooltip,
   Typography,
} from "@mui/material"
import AccountBoxIcon from "@mui/icons-material/AccountBox"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import Card from "@mui/material/Card"
import ColorizedAvatar from "../../../common/ColorizedAvatar"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import SaveIcon from "@mui/icons-material/Save"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import Link from "../../../common/Link"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"

const useStyles = makeStyles((theme) => ({
   speakerInformation: {
      position: "absolute",
      left: (props) => (props.small ? 10 : 40),
      bottom: (props) => (props.small ? 10 : 40),
      padding: (props) => (props.small ? 6 : 15),
      borderRadius: (props) => (props.small ? 5 : 10),
      textAlign: "left",
      color: theme.palette.common.white,
      boxShadow: theme.shadows[2],
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      maxWidth: (props) => (props.small ? "230px" : "100%"),
      zIndex: (props) => props.zIndex,
   },
   speakerName: {
      fontSize: (props) => (props.small ? "0.7rem" : "1rem"),
      maxWidth: (props) => (props.small ? "180px" : "100%"),
      margin: 0,
   },
   speakerData: {
      maxWidth: (props) => (props.small ? "180px" : "100%"),
   },
   speakerPosition: {
      fontWeight: "normal",
      fontSize: (props) => (props.small ? "0.6rem" : "1rem"),
      maxWidth: (props) => (props.small ? "180px" : "100%"),
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      margin: 0,
   },
   speakerAction: {
      marginLeft: 5,
   },
   speakerActionIconButton: {
      padding: 0,
   },
   speakerActionButton: {
      color: theme.palette.common.white,
      fontSize: (props) => (props.small ? 17 : 25),
   },
}))

const SpeakerInfoOverlay = ({ speaker, small, zIndex }) => {
   // small = true
   console.log("speaker", speaker)
   const [showDialog, setShowDialog] = React.useState(false)

   const closeDialog = useCallback(() => {
      setShowDialog(false)
   }, [])

   const openDialog = useCallback(() => {
      setShowDialog(true)
   }, [])

   const classes = useStyles({ small: small, zIndex })

   let NameHeader = "h3"
   let PositionHeader = "h4"

   if (small) {
      NameHeader = "h5"
      PositionHeader = "h5"
   }

   return (
      <>
         <div className={classes.speakerInformation}>
            <div className={small && classes.speakerData}>
               <div>
                  <NameHeader
                     className={classes.speakerName}
                  >{`${speaker.firstName} ${speaker.lastName}`}</NameHeader>
               </div>
               <div>
                  <PositionHeader
                     className={classes.speakerPosition}
                  >{`${speaker.position}`}</PositionHeader>
               </div>
            </div>
            <div className={classes.speakerAction}>
               <Tooltip title={`See details about this speaker`}>
                  <IconButton
                     className={classes.speakerActionIconButton}
                     onClick={openDialog}
                     size="large"
                  >
                     <AccountBoxIcon className={classes.speakerActionButton} />
                  </IconButton>
               </Tooltip>
            </div>
         </div>
         {showDialog && (
            <SpeakerDetailsDialog onClose={closeDialog} speaker={speaker} />
         )}
      </>
   )
}

const SpeakerDetailsDialog = ({ speaker, onClose }) => {
   const {
      currentLivestream: { speakers },
   } = useCurrentStream()

   const handleLinkedInClick = () => {
      let url = speaker.linkedIn
      if (!url.match(/^[a-zA-Z]+:\/\//)) {
         url = "https://" + url
      }
      window.open(url, "_blank")
   }

   const matchedSpeaker =
      getLivestreamMatchingSpeaker(speaker, speakers) ?? speaker

   const name = `${matchedSpeaker.firstName} ${matchedSpeaker.lastName}`
   let subtitle = matchedSpeaker.position
   if (matchedSpeaker.background) {
      subtitle = `${subtitle} (${matchedSpeaker.background} background)`
   }

   console.log("speakers", speakers)
   console.log("matchedSpeaker", matchedSpeaker)

   return (
      <Dialog open={true} onClose={onClose}>
         <DialogTitle>Speaker Details</DialogTitle>
         <DialogContent sx={{ paddingBottom: 0 }}>
            <Card sx={{ boxShadow: "none" }}>
               <CardHeader
                  sx={{ padding: "16px 0" }}
                  avatar={
                     <ColorizedAvatar
                        firstName={matchedSpeaker.firstName}
                        lastName={matchedSpeaker.lastName}
                        imageUrl={matchedSpeaker.avatar}
                     />
                  }
                  title={name}
                  subheader={subtitle}
                  titleTypographyProps={{ variant: "h6" }}
               />
               <CardActions sx={{ padding: "8px 0", justifyContent: "center" }}>
                  {speaker.linkedIn && (
                     <Tooltip title={`Go to LinkedIn profile`}>
                        <Button
                           startIcon={<LinkedInIcon />}
                           variant="contained"
                           style={{
                              backgroundColor: "#0E76A8",
                              marginRight: "10px",
                           }}
                           onClick={handleLinkedInClick}
                        >
                           LinkedIn
                        </Button>
                     </Tooltip>
                  )}
                  <SaveRecruiterButton />
               </CardActions>
            </Card>
         </DialogContent>
         <DialogActions>
            <Button color="grey" onClick={onClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   )
}

const SaveRecruiterButton = () => {
   const { userPresenter, isLoggedOut } = useAuth()

   console.log("isLoggedOut", isLoggedOut)
   console.log("userPresenter", userPresenter?.canSaveRecruiters())

   let tooltipMessage =
      "The speaker details will be saved on the My Recruiters page under your profile."

   if (isLoggedOut) {
      tooltipMessage = "You must be logged in to save a speaker."
   }

   if (!userPresenter?.canSaveRecruiters()) {
      return <SaveRecruiterButtonNoAccess />
   }

   return (
      <>
         <Tooltip title={tooltipMessage}>
            <span>
               <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={!userPresenter?.canSaveRecruiters()}
               >
                  Save For Later
               </Button>
            </span>
         </Tooltip>
      </>
   )
}

const SaveRecruiterButtonNoAccess = memo(() => {
   const [anchorEl, setAnchorEl] = React.useState(null)
   const [timeout, setTimeoutValue] = React.useState(null)
   const isMobile = useIsMobile()

   const requiredBadge = UserPresenter.saveRecruitersRequiredBadge()

   const handlePopoverOpen = (event) => {
      if (timeout) {
         clearTimeout(timeout)
      }
      setAnchorEl(event.currentTarget)
   }

   const handlePopoverClose = () => {
      // give some time for the user to click on the link
      setTimeoutValue(
         setTimeout(() => {
            setAnchorEl(null)
         }, 1000)
      )
   }

   const open = Boolean(anchorEl)

   return (
      <>
         <span
            aria-owns={open ? "mouse-over-popover" : undefined}
            aria-haspopup="true"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
         >
            <Button
               variant="contained"
               startIcon={<SaveIcon />}
               disabled={true}
            >
               {isMobile ? "Save" : "Save For Later"}
            </Button>
         </span>
         <Popover
            id="mouse-over-popover"
            sx={{
               pointerEvents: "none",
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "left",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "left",
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
         >
            <Typography sx={{ p: 1 }}>
               You have to unlock the{" "}
               <Link href="#">{requiredBadge.name} Badge</Link> to access this
               feature.
            </Typography>
         </Popover>
      </>
   )
})

/**
 * Find the livestream speaker object that matches the current speaker
 *
 * Matching happens by comparing the speaker's first and last name
 * @param currentSpeaker
 * @param allLivestreamSpeakers
 */
const getLivestreamMatchingSpeaker = (
   currentSpeaker,
   allLivestreamSpeakers
) => {
   if (!allLivestreamSpeakers) return null

   const exactMatch = allLivestreamSpeakers.find(
      (speaker) =>
         speaker.firstName === currentSpeaker.firstName &&
         speaker.lastName === currentSpeaker.lastName &&
         speaker.position === currentSpeaker.position
   )

   if (exactMatch) {
      return exactMatch
   }

   // partial match
   return allLivestreamSpeakers.find(
      (speaker) =>
         speaker.firstName === currentSpeaker.firstName &&
         speaker.lastName === currentSpeaker.lastName
   )
}

SpeakerInfoOverlay.prototypes = {
   speaker: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      position: PropTypes.string,
   }).isRequired,
   small: PropTypes.bool.isRequired,
   zIndex: PropTypes.number,
}
export default SpeakerInfoOverlay
