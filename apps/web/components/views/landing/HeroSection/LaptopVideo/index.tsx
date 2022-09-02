import React from "react"
import { blankLaptop, laptopUi } from "../../../../../constants/images"
import { smilingStreamerVideoUrl } from "../../../../../constants/videos"
import { Box } from "@mui/material"

const styles = {
   laptopImage: {
      width: "100%",
   },
   laptopUi: {
      width: "100%",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 2,
   },
   laptopScreenDiv: {
      top: "7.07%",
      left: "14.7%",
      width: "70.5%",
      height: "81.5%",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      zIndex: 1,
      position: "absolute",
   },
   laptopScreenInnerDiv: (theme) => ({
      position: "relative",
      width: "100%",
      height: "100%",
      background: theme.palette.common.black,
   }),
   laptopVideoWrapper: {
      top: "8%",
      left: "3.8%",
      right: "0.1%",
      bottom: "4.8%",
      position: "absolute",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   laptopVideo: {
      width: "100%",
      zIndex: 1,
   },
   laptop: {
      width: "100%",
      position: "relative",
      "& img": {},
      "& video": {},
   },
}

const LaptopVideo = ({ videoUrl }: Prop) => {
   return (
      <Box className={"laptop-video"} sx={styles.laptop}>
         <Box sx={styles.laptopScreenDiv}>
            <Box sx={styles.laptopScreenInnerDiv}>
               <Box sx={styles.laptopVideoWrapper}>
                  <Box
                     component="video"
                     sx={styles.laptopVideo}
                     autoPlay
                     loop
                     muted
                     src={videoUrl || smilingStreamerVideoUrl}
                  />
               </Box>
               <div>
                  <Box
                     component="img"
                     sx={styles.laptopUi}
                     src={laptopUi}
                     alt="ui"
                  />
               </div>
            </Box>
         </Box>
         <Box
            component="img"
            sx={styles.laptopImage}
            src={blankLaptop}
            alt="stream showcase laptop"
         />
      </Box>
   )
}

type Prop = {
   videoUrl?: string
}

export default LaptopVideo
