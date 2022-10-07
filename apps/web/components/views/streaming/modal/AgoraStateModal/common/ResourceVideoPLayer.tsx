import React from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import ReactPlayer from "react-player/youtube"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      position: "relative",
      aspectRatio: "16/9",
      borderRadius: 1,
      overflow: "hidden",
      boxShadow: 1,
      "&.react-player": {
         position: "absolute",
         top: 0,
         left: 0,
      },
   },
})
type Props = {
   videoUrl: string
   previewImageUrl: string
}
const ResourceVideoPLayer = ({ videoUrl, previewImageUrl }: Props) => {
   return (
      <Box sx={styles.root}>
         <ReactPlayer
            light={previewImageUrl}
            className="react-player"
            url={videoUrl}
            width="100%"
            height="100%"
            playing
            playsinline
            controls
            config={{
               playerVars: {
                  modestbranding: 1,
               },
            }}
         />
      </Box>
   )
}

export default ResourceVideoPLayer
