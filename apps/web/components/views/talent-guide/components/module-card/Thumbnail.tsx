import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ONBOARDING_VIDEO_URL_DESKTOP } from "components/util/constants"
import FramerBox from "components/views/common/FramerBox"
import Image from "next/image"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"
import { useModuleCardContext } from "./ModuleCard"

const styles = sxStyles({
   thumbnail: {
      position: "relative",
      width: 97,
      height: "inherit",
      borderRadius: "9px",
      overflow: "hidden",
      flexShrink: 0,
   },
   expandedThumbnailDesktop: {
      position: "relative",
      width: "100%",
      aspectRatio: "533/947",
      maxWidth: "533px",
      margin: "0 auto",
      borderRadius: "12px",
      overflow: "hidden",
   },
   expandedThumbnailMobile: {
      width: "100%",
      height: "100%",
   },
   mediaContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
   overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "black",
   },
})

type Props = {
   thumbnailUrl: string
   moduleId: string
   expanded?: boolean
}

export const Thumbnail = ({
   thumbnailUrl = "/levels/placeholder.jpeg",
   moduleId,
   expanded,
}: Props) => {
   const { hasFinishedExpanding } = useModuleCardContext()
   const isMobile = useIsMobile()

   if (expanded) {
      return (
         <FramerBox
            id="expanded-thumbnail"
            layoutId={`thumbnail-${moduleId}`}
            sx={[
               isMobile
                  ? styles.expandedThumbnailMobile
                  : styles.expandedThumbnailDesktop,
            ]}
         >
            <Box sx={styles.overlayContainer}>
               <Image
                  src={thumbnailUrl}
                  alt="Levels Module Thumbnail"
                  fill
                  priority
                  quality={100}
                  style={{ objectFit: "cover" }}
                  sizes="90vw"
               />
               <FramerBox
                  sx={styles.mediaContainer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hasFinishedExpanding ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
               >
                  <VideoThumbnail
                     thumbnailUrl={thumbnailUrl}
                     videoUrl={ONBOARDING_VIDEO_URL_DESKTOP}
                  />
               </FramerBox>
            </Box>
         </FramerBox>
      )
   }

   return (
      <FramerBox
         id="thumbnail"
         layoutId={`thumbnail-${moduleId}`}
         sx={styles.thumbnail}
      >
         <Image
            src={thumbnailUrl}
            alt="Levels Module Thumbnail"
            fill
            priority
            quality={100}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
         />
      </FramerBox>
   )
}

type VideoThumbnailProps = {
   thumbnailUrl: string
   videoUrl: string
}

const VideoThumbnail = ({ thumbnailUrl, videoUrl }: VideoThumbnailProps) => {
   const videoConfig = {
      file: {
         attributes: {
            poster: thumbnailUrl,
         },
      },
   }

   return (
      <Box
         sx={{
            width: "100% !important",
            height: "100% !important",
            "& video": {
               objectFit: "cover",
            },
         }}
         width="100%"
         height="100%"
         component={ReactPlayer}
         playsinline
         controls
         url={videoUrl}
         config={videoConfig}
         playing={true}
      />
   )
}
