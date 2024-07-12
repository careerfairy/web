import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { HostDetails } from "../../HostDetails"
import { SpeakersList } from "../SpeakersList"

const styles = sxStyles({ root: {} })

export const SelectSpeakerView = () => {
   return (
      <Box sx={styles.root}>
         <HostDetails />
         <SpeakersList />
      </Box>
   )
}
