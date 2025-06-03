import { mapSpeakerToPublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Button } from "@mui/material"
import { useRemoteUsers } from "agora-rtc-react"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { CreatorPreview } from "components/views/creator/CreatorPreview"
import { useStreamingContext } from "components/views/streaming-page/context"
import {
   buildAgoraSpeakerId,
   getStreamerDisplayName,
} from "components/views/streaming-page/util"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import {
   ProfileSelectEnum,
   useHostProfileSelection,
} from "../HostProfileSelectionProvider"
import { View } from "../View"

const styles = sxStyles({
   creatorPreview: {
      mt: {
         xs: 2,
         tablet: 3.5,
      },
      maxHeight: {
         tablet: 450,
      },
      width: {
         xs: "100%",
         tablet: 650,
      },
   },
})

export const JoinWithSpeakerView = () => {
   const {
      goBackToSelectSpeaker,
      selectedSpeaker,
      joinLiveStreamWithSpeaker,
      prevActiveView,
   } = useHostProfileSelection()
   const { livestreamId } = useStreamingContext()
   const remoteUsers = useRemoteUsers()
   const isMobile = useStreamIsMobile()

   const displayName = getStreamerDisplayName(
      selectedSpeaker?.firstName,
      selectedSpeaker?.lastName
   )

   const isSpeakerInUse = useMemo(() => {
      const agoraSpeakerId = buildAgoraSpeakerId(
         selectedSpeaker?.id,
         livestreamId
      )
      return remoteUsers.some((user) => user.uid === agoraSpeakerId)
   }, [remoteUsers, selectedSpeaker?.id, livestreamId])

   const userJustEditedSpeaker =
      prevActiveView === ProfileSelectEnum.EDIT_SPEAKER

   const name = (
      <Box color="primary.main" component="span">
         {displayName}
      </Box>
   )

   return (
      <View>
         <View.Content>
            {isSpeakerInUse ? (
               <View.Title>{name} is that really you?</View.Title>
            ) : (
               <View.Title>Hello {name}</View.Title>
            )}
            <View.Subtitle>
               {isSpeakerInUse
                  ? "Your profile has already joined this live stream: either you have it open in another browser or someone else has selected your profile by mistake."
                  : "Whenever you’re ready to join, click on the button below"}
            </View.Subtitle>
            <CreatorPreview
               sx={styles.creatorPreview}
               creator={
                  selectedSpeaker
                     ? mapSpeakerToPublicCreator(selectedSpeaker)
                     : undefined
               }
            />
         </View.Content>
         <View.Actions>
            <Button
               color="grey"
               variant="outlined"
               onClick={goBackToSelectSpeaker}
            >
               {userJustEditedSpeaker
                  ? isMobile
                     ? "Change"
                     : "Select another profile"
                  : "Back"}
            </Button>
            <Button
               variant="contained"
               color="primary"
               onClick={() => {
                  joinLiveStreamWithSpeaker(selectedSpeaker?.id)
               }}
            >
               {isSpeakerInUse
                  ? "Join here"
                  : userJustEditedSpeaker
                  ? `Join as ${selectedSpeaker?.firstName}`
                  : "Join live stream"}
            </Button>
         </View.Actions>
      </View>
   )
}
