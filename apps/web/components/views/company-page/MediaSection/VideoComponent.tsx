import { sxStyles } from "../../../../types/commonTypes"
import { GroupVideo } from "@careerfairy/shared-lib/groups"
import React, { FC, useMemo, useState } from "react"
import { Box, Button, IconButton, Typography } from "@mui/material"
import ReactPlayer, { Config } from "react-player"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import EditIcon from "@mui/icons-material/Edit"
import Image from "next/legacy/image"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { videoImagePlaceholder } from "../../../../constants/images"
import ConditionalWrapper from "components/util/ConditionalWrapper"

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
   playOverlayEmpty: {
      borderRadius: 3,
      position: "absolute",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.0)",
      "&:hover": {
         cursor: "pointer",
      },
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
   const isVimeo = useMemo(() => {
      return isVimeoByUrl(video.url)
   }, [video.url])

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
               // Vimeo SDK has an issue, see https://github.com/CookPete/react-player/issues/520
               // If the controls varible @playVideo changes, it does not reflect and so even after play
               // vimeo controls are not shown making pausing not possible. For them to be shown it must be set
               // at first time as true
               controls={playVideo}
               playing={playVideo}
               config={editMode ? undefined : config}
               width={"100%"}
               height={"100%"}
               url={video.url}
               onEnded={() => setPlayVideo(false)}
            />
            {playVideo ? (
               <ConditionalWrapper condition={isVimeo}>
                  <Box
                     sx={styles.playOverlayEmpty}
                     onClick={() => setPlayVideo(false)}
                  />
               </ConditionalWrapper>
            ) : (
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
                     Edit video
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

const config: Config = {
   file: { attributes: { controlsList: "nodownload" } },
}

/**
 * Determines if the received video URL belongs to Vimeo player
 * @param url Video URL as non empty string
 * @returns true if video contains domain 'vimeo.com', could be enhanced
 */
const isVimeoByUrl = (url: string): boolean => {
   return url.includes("vimeo.com")
}

export default VideoComponent
