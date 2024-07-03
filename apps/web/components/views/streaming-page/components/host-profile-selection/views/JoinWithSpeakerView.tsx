import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"

const styles = sxStyles({ root: {} })

export const JoinWithSpeakerView = () => {
   const { goBackToSelectSpeaker, selectedSpeaker, joinLiveStreamWithSpeaker } =
      useHostProfileSelection()

   return (
      <Box sx={styles.root}>
         <Button onClick={goBackToSelectSpeaker}>Back</Button>
         <Button
            onClick={() => {
               joinLiveStreamWithSpeaker(selectedSpeaker?.id)
            }}
         >
            Join live stream
         </Button>
      </Box>
   )
}
