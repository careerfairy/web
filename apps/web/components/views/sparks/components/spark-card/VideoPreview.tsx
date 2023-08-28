import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import Box from "@mui/material/Box"
import { FC, Fragment, useCallback, useEffect, useState } from "react"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"
import { BaseReactPlayerProps, OnProgressProps } from "react-player/base"

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
   },
   containThumbnail: {
      "& .player": {
         "& .react-player__preview": {
            backgroundSize: "contain !important",
            backgroundRepeat: "no-repeat !important",
            backgroundPosition: "center !important",
         },
      },
   },
   progress: {
      background: "none",
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      [`& .${linearProgressClasses.bar}`]: {
         bgcolor: "primary.600",
      },
      zIndex: (theme) => theme.zIndex.drawer + 1,
      height: 4.5,
   },
})

type Props = {
   videoUrl: string
   thumbnailUrl: string
   playing?: boolean
   containThumbnail?: boolean
}

const VideoPreview: FC<Props> = ({
   videoUrl,
   thumbnailUrl,
   playing,
   containThumbnail,
}) => {
   const [progress, setProgress] = useState(0)

   useEffect(() => {
      return () => {
         setProgress(0)
      }
   }, [])

   const handleProgress = useCallback((progress: OnProgressProps) => {
      setProgress(progress.played * 100)
   }, [])

   const handleError: BaseReactPlayerProps["onError"] = (
      error,
      data,
      hlsINstance,
      hlsGlobal
   ) => {
      console.log("🚀 ~ file: VideoPreview.tsx:84 ~ hlsGlobal:", hlsGlobal)
      console.log("🚀 ~ file: VideoPreview.tsx:84 ~ hlsINstance:", hlsINstance)
      console.log("🚀 ~ file: VideoPreview.tsx:84 ~ data:", data)
      console.log("🚀 ~ file: VideoPreview.tsx:96 ~ error:", error)
   }

   return (
      <Box sx={styles.root}>
         <Box
            sx={[
               styles.playerWrapper,
               containThumbnail && styles.containThumbnail,
            ]}
         >
            <ReactPlayer
               playing={playing}
               playsinline={playing}
               loop={playing}
               width="100%"
               height="100%"
               className="player"
               onProgress={handleProgress}
               onError={handleError}
               progressInterval={500}
               url={videoUrl}
               light={!playing && thumbnailUrl}
               playIcon={<Fragment />}
            />
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={progress}
            />
         </Box>
      </Box>
   )
}

type FallBackComponentProps = {
   thumbnailUrl: string
}

export default VideoPreview
