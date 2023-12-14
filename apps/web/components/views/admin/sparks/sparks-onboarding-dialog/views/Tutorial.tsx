import { Box, Stack } from "@mui/material"
import { sparksTutorialVideoUrlImageKit } from "constants/transformedVideos"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"
import { useOnboarding } from "../OnboardingProvider"
import TimelineView from "../TimelineView"

const styles = sxStyles({
   root: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
   },
   videoContainer: {
      pt: {
         xs: 0,
         sm: 6.25,
      },
      borderRadius: "16px",
      "& video": {
         borderRadius: "16px",
         objectFit: "cover",
      },
   },
})

const Tutorial = () => {
   const { handleNext, handleBack } = useOnboarding()

   return (
      <Box sx={styles.root}>
         <Box textAlign="center" sx={styles.videoContainer}>
            <ReactPlayer
               width="100%"
               height="100%"
               playsinline
               controls
               url={sparksTutorialVideoUrlImageKit}
               config={videoConfig}
               playing={true}
            />
         </Box>
         <Stack width="100%" direction="row" justifyContent="space-between">
            <TimelineView.Button
               onClick={handleBack}
               variant="outlined"
               color="grey"
            >
               Back
            </TimelineView.Button>
            <TimelineView.Button
               onClick={handleNext}
               variant="contained"
               color="secondary"
            >
               Next
            </TimelineView.Button>
         </Stack>
      </Box>
   )
}

const videoConfig = {
   file: {
      attributes: {
         controlsList: "nodownload noplaybackrate",
         disablePictureInPicture: true,
         playsInline: true,
      },
   },
}

export default Tutorial
