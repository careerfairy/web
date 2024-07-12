import { Box, ButtonBase, Typography } from "@mui/material"
import { useLivestreamData } from "components/custom-hook/streaming"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "./HostProfileSelectionProvider"

const styles = sxStyles({ root: {} })

export const SpeakersList = () => {
   const { selectSpeaker } = useHostProfileSelection()
   const livestream = useLivestreamData()

   return (
      <Box sx={styles.root}>
         {livestream.speakers?.map((speaker) => (
            <ButtonBase key={speaker.id} onClick={() => selectSpeaker(speaker)}>
               <CircularLogo
                  src={speaker.avatar}
                  size={80}
                  alt={speaker.firstName}
                  objectFit="cover"
               />
               <Typography>{speaker.firstName}</Typography>
            </ButtonBase>
         ))}
      </Box>
   )
}
