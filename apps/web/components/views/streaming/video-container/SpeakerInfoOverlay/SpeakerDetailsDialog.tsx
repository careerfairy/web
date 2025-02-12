import CloseIcon from "@mui/icons-material/Close"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import {
   Button,
   CardActions,
   CardHeader,
   Dialog,
   DialogContent,
   DialogTitle,
   Tooltip,
   Typography,
} from "@mui/material"
import Card from "@mui/material/Card"
import IconButton from "@mui/material/IconButton"
import { AnalyticsEvents } from "util/analytics/types"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import { dataLayerEvent } from "../../../../../util/analyticsUtils"
import { makeExternalLink } from "../../../../helperFunctions/HelperFunctions"
import ColorizedAvatar from "../../../common/ColorizedAvatar"
import { SaveRecruiterButton } from "./SaveRecruiterButton"

const styles = sxStyles({
   dialogClose: {
      position: "absolute",
      top: "11px",
      right: "5px",
   },
   subtitle: {
      fontStyle: "italic",
      fontWeight: 300,
      fontSize: "14px",
      color: "text.secondary",
   },
   linkedInbutton: {
      boxShadow: "0px 3px 6px rgba(0, 70, 104, 0.5)",
      backgroundColor: "#0E76A8",
      marginRight: "10px",
      "&:hover": {
         backgroundColor: "#004464",
      },
   },
   dialogContent: {
      paddingBottom: 0,
      "& .MuiPaper-root": {
         background: "transparent",
      },
   },
})

const SpeakerDetailsDialog = ({ speaker, onClose }) => {
   const { userData } = useAuth()
   const {
      currentLivestream: { speakers },
   } = useCurrentStream()

   let matchedSpeaker =
      getLivestreamMatchingSpeaker(speaker, speakers) ?? speaker

   // merge fields
   matchedSpeaker = {
      ...matchedSpeaker,
      linkedIn: speaker.linkedIn,
      position: matchedSpeaker.position ?? speaker.position,
      userId: matchedSpeaker.userId ?? speaker.userId,
   }

   const name = `${matchedSpeaker.firstName} ${matchedSpeaker.lastName}`
   let subtitle = matchedSpeaker.position
   if (matchedSpeaker.background) {
      subtitle = `${subtitle} (${matchedSpeaker.background.trim()} background)`
   }

   // user can't save himself if logged in (or save a hand raised user)
   // logged out, we show the save button
   const isSelf = matchedSpeaker?.userId === userData?.authId
   const isHandRaiser = matchedSpeaker?.position?.includes("Hand Raiser")
   const canSave = userData ? !isSelf && !isHandRaiser : true

   return (
      <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth={"sm"}>
         <DialogTitle>Speaker Details</DialogTitle>
         <IconButton onClick={onClose} sx={styles.dialogClose}>
            <CloseIcon />
         </IconButton>
         <DialogContent sx={styles.dialogContent} dividers={true}>
            <Card sx={{ boxShadow: "none" }}>
               <CardHeader
                  sx={{ padding: "16px 0", alignItems: "start" }}
                  avatar={
                     <ColorizedAvatar
                        sx={{
                           width: "70px",
                           height: "70px",
                        }}
                        firstName={matchedSpeaker.firstName}
                        lastName={matchedSpeaker.lastName}
                        imageUrl={matchedSpeaker.avatar}
                     />
                  }
                  title={name}
                  subheader={
                     <Typography sx={styles.subtitle}>{subtitle}</Typography>
                  }
                  titleTypographyProps={{
                     variant: "h6",
                     sx: { marginTop: "5px", marginBottom: "2px" },
                  }}
               />
               <CardActions
                  sx={{
                     padding: "8px 0",
                     justifyContent: "center",
                     marginBottom: "15px",
                  }}
               >
                  {Boolean(speaker.linkedIn) && (
                     <Tooltip title={`Go to LinkedIn profile`}>
                        <Button
                           startIcon={<LinkedInIcon />}
                           variant="contained"
                           sx={styles.linkedInbutton}
                           onClick={() => handleLinkedInClick(speaker.linkedIn)}
                        >
                           View Profile
                        </Button>
                     </Tooltip>
                  )}
                  {Boolean(canSave) && (
                     <SaveRecruiterButton speaker={matchedSpeaker} />
                  )}
               </CardActions>
            </Card>
         </DialogContent>
      </Dialog>
   )
}

const handleLinkedInClick = (url) => {
   window.open(makeExternalLink(url), "_blank")
   dataLayerEvent(AnalyticsEvents.LivestreamSpeakerLinkedinClick)
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
         speaker?.firstName?.trim() === currentSpeaker?.firstName?.trim() &&
         speaker?.lastName?.trim() === currentSpeaker?.lastName?.trim() &&
         speaker?.position?.trim() === currentSpeaker?.position?.trim()
   )

   if (exactMatch) {
      return exactMatch
   }

   // partial match
   return allLivestreamSpeakers.find(
      (speaker) =>
         speaker?.firstName?.trim() === currentSpeaker?.firstName?.trim() &&
         speaker?.lastName?.trim() === currentSpeaker?.lastName?.trim()
   )
}

export default SpeakerDetailsDialog
