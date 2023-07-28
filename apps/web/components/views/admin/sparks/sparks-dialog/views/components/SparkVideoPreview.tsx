import ChangeIcon from "@mui/icons-material/AutorenewRounded"
import { Button } from "@mui/material"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import PlayIcon from "components/views/common/icons/PlayIcon"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import { FC } from "react"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"

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
      fontSize: 70, // or any size you want for the icon
   },
})

type Props = {
   url: string
   fileUploaderProps: FileUploaderProps
   thumbnailUrl: string
}

const SparkVideoPreview: FC<Props> = ({
   url,
   fileUploaderProps,
   thumbnailUrl,
}) => {
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
            url={url}
            className="react-player"
            width="100%"
            height="100%"
            playsinline
            playing
            light={thumbnailUrl}
            playIcon={<PlayIcon sx={styles.playIcon} />}
            config={config}
            controls
            loop
         />
      </SparkAspectRatioBox>
   )
}

const config = {
   attributes: {
      controlsList: "nofullscreen nodownload",
   },
} as const

export default SparkVideoPreview
