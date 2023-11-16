import { sxStyles } from "../../../../types/commonTypes"
import { GroupVideo } from "@careerfairy/shared-lib/groups"
import React, { FC, useState } from "react"
import { Box, Button, IconButton, Typography } from "@mui/material"
import ReactPlayer, { Config } from "react-player"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import EditIcon from "@mui/icons-material/Edit"
import Image from "next/legacy/image"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { videoImagePlaceholder } from "../../../../constants/images"

const styles = sxStyles({
   videoWrapper: {
      paddingTop: "56.25%",
      position: "relative",
      maxHeight: 240,
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: 2,
      "& #company-video-player": {
         top: 0,
         left: 0,
         position: "absolute",
      },
      mb: 2,
   },
   icon: {
      zIndex: 2,
      width: "60px",
      height: "60px",
      left: "999px",
      top: "475px",
      background: "rgba(33, 32, 32, 0.6)",
      border: "2px solid white",
      borderRadius: "50%",
      color: "white",
      "&:hover": {
         border: (theme) => `3px solid ${theme.palette.primary.main}`,
      },
   },
   playOverlay: {
      borderRadius: 3,
      position: "absolute",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
   },
   editBtnWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      p: 1.5,
      width: "100%",
      justifyContent: "flex-end",
      display: "flex",
   },
   placeholderWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      border: "dashed",
      borderRadius: 2,
      borderColor: "grey.400",
      borderWidth: 2,
      height: 250,
      cursor: "pointer",
   },
})

type Props = {
   video: GroupVideo
   openVideoDialog?: () => void
   editMode?: boolean
}
const VideoComponent: FC<Props> = ({ video, openVideoDialog, editMode }) => {
   const [playVideo, setPlayVideo] = useState(false)

   if (!video) {
      return (
         <Box onClick={openVideoDialog} sx={styles.placeholderWrapper}>
            <Box width={"45%"} position={"relative"} height={"45%"}>
               <Image
                  layout={"fill"}
                  objectFit={"contain"}
                  src={getResizedUrl(videoImagePlaceholder, "sm")}
                  alt="placeholder"
               />
            </Box>
         </Box>
      )
   }

   return (
      <Box>
         <Box sx={styles.videoWrapper}>
            <ReactPlayer
               id={"company-video-player"}
               controls={playVideo}
               playing={playVideo}
               config={editMode ? undefined : config}
               width={"100%"}
               height={"100%"}
               url={video.url}
               onEnded={() => setPlayVideo(false)}
            />
            {playVideo ? null : (
               <Box sx={styles.playOverlay}>
                  <IconButton onClick={() => setPlayVideo(true)}>
                     <PlayIcon sx={styles.icon} />
                  </IconButton>
               </Box>
            )}
            {editMode ? (
               <Box component={"span"} sx={styles.editBtnWrapper}>
                  <Button
                     onClick={openVideoDialog}
                     variant="contained"
                     color={"info"}
                     startIcon={<EditIcon />}
                  >
                     Edit Video
                  </Button>
               </Box>
            ) : null}
         </Box>
         <Typography gutterBottom variant="h6" fontWeight={"500"} color="black">
            {video.title}
         </Typography>
         <Typography variant="body1" color="text.secondary">
            {video.description}
         </Typography>
      </Box>
   )
}

const config: Config = { file: { attributes: { controlsList: "nodownload" } } }

export default VideoComponent
