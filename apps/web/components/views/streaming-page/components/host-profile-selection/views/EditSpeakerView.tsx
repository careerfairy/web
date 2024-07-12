import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"

const styles = sxStyles({ root: {} })

export const EditSpeakerView = () => {
   const { goBackToSelectSpeaker } = useHostProfileSelection()
   return (
      <Box sx={styles.root}>
         EditSpeakerView
         <Button onClick={goBackToSelectSpeaker}>Back</Button>
         <Button
            disabled
            onClick={() => {
               /**
                * TODO:
                * 1. Update Creator if exists
                * 2. Update related Speaker on live stream
                */
               goBackToSelectSpeaker()
            }}
         >
            Save changes (not implemented yet)
         </Button>
      </Box>
   )
}
