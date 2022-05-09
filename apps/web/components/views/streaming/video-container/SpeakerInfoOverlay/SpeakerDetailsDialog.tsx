import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import {
   Button,
   CardActions,
   CardHeader,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Popover,
   Tooltip,
   Typography,
} from "@mui/material"
import Card from "@mui/material/Card"
import ColorizedAvatar from "../../../common/ColorizedAvatar"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import SaveIcon from "@mui/icons-material/Save"
import React, { useState } from "react"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import Link from "../../../common/Link"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { SavedRecruiter } from "@careerfairy/shared-lib/dist/users"
import { pick } from "lodash"
import useRecruiterData from "./useRecruiterData"
import LoadingButton from "@mui/lab/LoadingButton"

const SpeakerDetailsDialog = ({ speaker, onClose }) => {
   const {
      currentLivestream: { speakers },
   } = useCurrentStream()

   const matchedSpeaker =
      getLivestreamMatchingSpeaker(speaker, speakers) ?? speaker

   const name = `${matchedSpeaker.firstName} ${matchedSpeaker.lastName}`
   let subtitle = matchedSpeaker.position
   if (matchedSpeaker.background) {
      subtitle = `${subtitle} (${matchedSpeaker.background} background)`
   }

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
                           onClick={() => handleLinkedInClick(speaker.linkedIn)}
                        >
                           LinkedIn
                        </Button>
                     </Tooltip>
                  )}
                  <SaveRecruiterButton speaker={matchedSpeaker} />
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

const handleLinkedInClick = (url) => {
   if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = "https://" + url
   }
   window.open(url, "_blank")
}

const SaveRecruiterButton = ({ speaker }) => {
   const { userPresenter, isLoggedOut } = useAuth()
   const { currentLivestream } = useCurrentStream()
   const { isLoading, recruiterData, saveRecruiter, recruiterSaved } =
      useRecruiterData(speaker.id)

   let tooltipMessage =
      "The speaker details will be saved on the My Recruiters page under your profile."

   if (isLoggedOut) {
      tooltipMessage = "You must be logged in to save a speaker."
   }

   const isAlreadySaved = Boolean(recruiterData || recruiterSaved)

   if (isAlreadySaved) {
      tooltipMessage = "This Speaker is already on your saved list."
   }

   if (!userPresenter?.canSaveRecruiters()) {
      return <SaveRecruiterButtonNoAccess />
   }

   const onClick = () => {
      const recruiter: SavedRecruiter = createSavedRecruiter(
         userPresenter.model.id,
         currentLivestream,
         speaker
      )

      saveRecruiter(recruiter).catch(console.error)
   }

   const isButtonDisabled = Boolean(
      isLoading || !userPresenter?.canSaveRecruiters()
   )

   return (
      <>
         <Tooltip title={tooltipMessage}>
            <span>
               <LoadingButton
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isButtonDisabled || isAlreadySaved}
                  onClick={onClick}
                  loading={isLoading}
               >
                  {isAlreadySaved ? "Saved" : "Save for later"}
               </LoadingButton>
            </span>
         </Tooltip>
      </>
   )
}

const SaveRecruiterButtonNoAccess = () => {
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
}

const createSavedRecruiter = (userId, currentLivestream, speaker) => {
   const recruiterInfo: SavedRecruiter = {
      id: speaker.id,
      livestreamId: currentLivestream.id,
      userId: userId,
      savedAt: null, // will be set by the server

      livestreamDetails: pick(currentLivestream, [
         "title",
         "company",
         "summary",
         "start",
         "companyLogoUrl",
      ]),

      streamerDetails: pick(speaker, [
         "linkedIn",
         "firstName",
         "lastName",
         "position",
         "id",
         "avatar",
         "background",
      ]),
   }

   return recruiterInfo
}

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

export default SpeakerDetailsDialog
