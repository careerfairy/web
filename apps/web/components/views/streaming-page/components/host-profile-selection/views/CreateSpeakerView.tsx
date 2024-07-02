import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"

const styles = sxStyles({ root: {} })

export const CreateSpeakerView = () => {
   const {
      goBackToSelectSpeaker,
      // joinLiveStream,
   } = useHostProfileSelection()

   return (
      <Box sx={styles.root}>
         CreateSpeakerView
         <Button onClick={goBackToSelectSpeaker}>Back</Button>
         <Button
            disabled
            onClick={() => {
               /**
                * TODO:
                * 1. Create Creator
                * 2. Save Creator as Speaker on Live Stream
                * 3. joinLiveStream(createdSpeaker.id)
                */
            }}
         >
            Join live stream (not implemented yet)
         </Button>
      </Box>
   )
}
