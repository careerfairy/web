import React, { FC, useCallback, useRef, useState } from "react"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import { Button } from "@mui/material"
import ChangeIcon from "@mui/icons-material/AutorenewRounded"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import PlayIcon from "components/views/common/icons/PlayIcon"

const styles = sxStyles({
   root: {
      backgroundColor: "#000",
      borderRadius: 2,
      position: "relative",
   },
   uploadBtn: {
      position: "absolute",
      top: 0,
      left: 0,
      ml: 1,
      mt: 1,
      zIndex: 1,
      background: "rgba(0, 0, 0, 0.25)",
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "normal",
      whiteSpace: "nowrap",
      "&:hover": {
         background: "rgba(0, 0, 0, 0.5)",
      },
      textTransform: "none",
      px: 1.5,
      py: 0.5,
   },
   playIcon: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: 70, // or any size you want for the icon
      zIndex: 2,
      cursor: "pointer",
   },
})

type Props = {
   url: string
   fileUploaderProps: FileUploaderProps
}

const SparkVideoPreview: FC<Props> = ({ url, fileUploaderProps }) => {
   const [playing, setPlaying] = useState(false)
   const playerRef = useRef(null)

   const handlePlayIconClick = useCallback(() => {
      if (playerRef && playerRef.current) {
         setPlaying(true)
      }
   }, [])

   return (
      <SparkAspectRatioBox sx={styles.root}>
         <FileUploader {...fileUploaderProps}>
            <Button
               variant="outlined"
               color="info"
               size="small"
               sx={styles.uploadBtn}
               startIcon={<ChangeIcon />}
            >
               Change video
            </Button>
         </FileUploader>
         <ReactPlayer
            playing={playing}
            ref={playerRef}
            url={url}
            className="react-player"
            width="100%"
            height="100%"
            playsinline
            config={config}
            controls={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            loop
         />
         {!playing && (
            <PlayIcon sx={styles.playIcon} onClick={handlePlayIconClick} />
         )}
      </SparkAspectRatioBox>
   )
}

const config = {
   attributes: {
      controlsList: "nofullscreen nodownload",
   },
} as const

export default SparkVideoPreview
