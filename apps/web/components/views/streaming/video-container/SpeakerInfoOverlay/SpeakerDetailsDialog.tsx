import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import {
   Button,
   CardActions,
   CardHeader,
   Dialog,
   DialogContent,
   DialogTitle,
   Divider,
   Tooltip,
   Typography,
} from "@mui/material"
import Card from "@mui/material/Card"
import ColorizedAvatar from "../../../common/ColorizedAvatar"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import { SaveRecruiterButton } from "./SaveRecruiterButton"
import { sxStyles } from "../../../../../types/commonTypes"

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
      color: "#545454",
   },
   linkedInbutton: {
      boxShadow: "0px 3px 6px rgba(0, 70, 104, 0.5)",
      backgroundColor: "#0E76A8",
      marginRight: "10px",
      "&:hover": {
         backgroundColor: "#004464",
      },
   },
})

const SpeakerDetailsDialog = ({ speaker, onClose }) => {
   const { userData } = useAuth()
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

   // user can't save himself if logged in
   // logged out, we show the save button
   const canSave = userData ? matchedSpeaker?.userId !== userData?.authId : true

   return (
      <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth={"sm"}>
         <DialogTitle>Speaker Details</DialogTitle>
         <IconButton onClick={onClose} sx={styles.dialogClose}>
            <CloseIcon />
         </IconButton>
         <Divider />
         <DialogContent sx={{ paddingBottom: 0 }}>
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
                  {speaker.linkedIn && (
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
                  {canSave && <SaveRecruiterButton speaker={matchedSpeaker} />}
               </CardActions>
            </Card>
         </DialogContent>
      </Dialog>
   )
}

const handleLinkedInClick = (url) => {
   if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = "https://" + url
   }
   window.open(url, "_blank")
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
