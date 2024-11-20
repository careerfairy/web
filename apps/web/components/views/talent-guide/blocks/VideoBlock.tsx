import { Stack, Typography } from "@mui/material"
import PlayIcon from "components/views/common/icons/PlayIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { VideoBlockType } from "data/hygraph/types"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      "& .react-player": {
         borderRadius: "8px",
         overflow: "hidden",
         border: (theme) => `1px solid ${theme.palette.neutral["50"]}`,
      },
   },
   playIcon: {
      fontSize: 70,
   },
   avatarContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 1,
   },
   avatarLabel: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
   },
   videoTitle: {
      color: (theme) => theme.palette.neutral["800"],
      textOverflow: "ellipsis",
      fontWeight: 600,
   },
})

type Props = VideoBlockType

export const VideoBlock = ({
   video,
   videoThumbnail,
   avatar,
   label,
   videoTitle,
}: Props) => {
   return (
      <Stack gap={1} sx={styles.root}>
         <ReactPlayer
            url={video.url}
            className="react-player"
            width="343px"
            height="173px"
            playsinline
            playing
            playIcon={<PlayIcon sx={styles.playIcon} />}
            light={videoThumbnail.url}
            config={{
               file: {
                  attributes: {
                     controlsList: "nodownload",
                  },
               },
            }}
            controls
         />
         <Stack sx={styles.avatarContainer}>
            <CircularLogo src={avatar.url} alt={avatar.alt} size={28} />
            <Typography variant="small" sx={styles.avatarLabel}>
               {label}
            </Typography>
         </Stack>
         <Typography variant="brandedBody" sx={styles.videoTitle}>
            {videoTitle}
         </Typography>
      </Stack>
   )
}
