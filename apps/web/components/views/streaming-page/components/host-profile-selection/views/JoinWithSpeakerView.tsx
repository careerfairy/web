import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"

const styles = sxStyles({ root: {} })

export const JoinWithSpeakerView = () => {
   const { goBackToSelectSpeaker, selectedSpeaker, joinLiveStream } =
      useHostProfileSelection()

   return (
      <Box sx={styles.root}>
         <Button onClick={goBackToSelectSpeaker}>Back</Button>
         <Button
            onClick={() => {
               joinLiveStream(selectedSpeaker?.id)
            }}
         >
            Join live stream
         </Button>
      </Box>
   )
}
