import Box from "@mui/material/Box"
import { FC, Fragment } from "react"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "absolute",
      inset: 0,
      background: "black",
   },
   playerWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
      "& .player": {
         background: "black",
         position: "absolute",
         top: 0,
         left: 0,
      },
   },
   withAspectRatio: {
      // Portrait aspect ratio, e.g., 9:16
      paddingTop: "177.77%", // (16 / 9) * 100%
   },
})

type Props = {
   videoUrl: string
   thumbnailUrl: string
   playing?: boolean
}

const VideoPreview: FC<Props> = ({ videoUrl, thumbnailUrl, playing }) => {
   return (
      <Box sx={styles.root}>
         <Box sx={[styles.playerWrapper, playing && styles.withAspectRatio]}>
            <ReactPlayer
               playing={playing}
               playsinline={playing}
               loop={playing}
               width="100%"
               height="100%"
               className="player"
               url={videoUrl}
               light={!playing && thumbnailUrl}
               playIcon={<Fragment />}
            />
         </Box>
      </Box>
   )
}

export default VideoPreview
