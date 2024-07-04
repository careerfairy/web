import { mapSpeakerToCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Button } from "@mui/material"
import { CreatorPreview } from "components/views/creator/CreatorPreview"
import { getStreamerDisplayName } from "components/views/streaming-page/util"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"
import { View } from "../View"

export const JoinWithSpeakerView = () => {
   const { goBackToSelectSpeaker, selectedSpeaker, joinLiveStreamWithSpeaker } =
      useHostProfileSelection()

   return (
      <View>
         <View.Content>
            <View.Title>
               Hello{" "}
               <Box color="primary.main" component="span">
                  {getStreamerDisplayName(
                     selectedSpeaker?.firstName,
                     selectedSpeaker?.lastName
                  )}
               </Box>
            </View.Title>
            <View.Subtitle>
               Whenever you’re ready to join, click on the button below
            </View.Subtitle>
            <CreatorPreview creator={mapSpeakerToCreator(selectedSpeaker)} />
         </View.Content>
         <View.Actions>
            <Button
               color="grey"
               variant="outlined"
               onClick={goBackToSelectSpeaker}
            >
               Back
            </Button>
            <Button
               variant="contained"
               color="primary"
               onClick={() => {
                  joinLiveStreamWithSpeaker(selectedSpeaker?.id)
               }}
            >
               Join live stream
            </Button>
         </View.Actions>
      </View>
   )
}
