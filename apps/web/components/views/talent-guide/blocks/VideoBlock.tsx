import { Box, Stack, Typography } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import PlayIcon from "components/views/common/icons/PlayIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { VideoBlockType } from "data/hygraph/types"
import ReactPlayer from "react-player"
import { trackLevelsVideoPlay } from "store/reducers/talentGuideReducer"
import { sxStyles } from "types/commonTypes"
import { AuthorPromotion } from "./AuthorPromotion"

const styles = sxStyles({
   root: {
      maxWidth: "100%",
   },
   videoContainer: {
      border: (theme) => `1px solid ${theme.palette.neutral["50"]}`,
      borderRadius: "8px",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      aspectRatio: "16 / 9",
      "& .react-player": {
         height: "100% !important",
      },
      "& .react-player__preview": {
         backgroundSize: "contain !important",
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

const Content = (props: Props) => {
   const { video, videoThumbnail, avatar, label, videoTitle, id } = props
   const dispatch = useAppDispatch()

   const handlePlay = () => {
      dispatch(
         trackLevelsVideoPlay({
            videoId: id,
            videoTitle,
         })
      )
   }

   return (
      <Stack data-testid="talent-guide-video-block" gap={1} sx={styles.root}>
         <Box sx={styles.videoContainer}>
            <ReactPlayer
               url={video.url}
               className="react-player"
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
               onPlay={handlePlay}
               progressInterval={250}
            />
         </Box>
         {Boolean(!props.promotionData) && (
            <Stack sx={styles.avatarContainer}>
               <CircularLogo src={avatar.url} alt={avatar.alt} size={28} />
               <Typography variant="small" sx={styles.avatarLabel}>
                  {label}
               </Typography>
            </Stack>
         )}
         <Typography
            variant="brandedBody"
            sx={[
               styles.videoTitle,
               props.promotionData ? { paddingBottom: "4px" } : {},
            ]}
         >
            {videoTitle}
         </Typography>
      </Stack>
   )
}

export const VideoBlock = (props: Props) => {
   return props.promotionData ? (
      <AuthorPromotion {...props.promotionData}>
         <Content {...props} />
      </AuthorPromotion>
   ) : (
      <Content {...props} />
   )
}
