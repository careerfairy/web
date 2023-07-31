import Box from "@mui/material/Box"
import { FC } from "react"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "absolute",
      inset: 0,
      zIndex: -1,
      "& .player": {
         "& video": {
            objectFit: "cover",
            objectPosition: "center",
         },
      },
   },
})

type Props = {
   videoUrl: string
}

const VideoPreview: FC<Props> = ({ videoUrl }) => {
   return (
      <Box sx={styles.root}>
         <ReactPlayer
            width="100%"
            height="100%"
            className="player"
            url={videoUrl}
         />
      </Box>
   )
}

export default VideoPreview
