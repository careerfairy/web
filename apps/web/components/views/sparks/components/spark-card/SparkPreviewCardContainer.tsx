import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import React, { FC } from "react"
import { sxStyles } from "types/commonTypes"
import VideoPreview from "./VideoPreview"

export const SPARK_DESKTOP_WIDTH = 232
export const SPARK_MOBILE_WIDTH = 150

const styles = sxStyles({
   root: {
      color: "white",
      display: "flex",
      objectFit: "cover",
      borderRadius: 3,
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
      aspectRatio: "9/16",
      // CSS hack for Safari to fix https://linear.app/careerfairy/issue/CF-1251/sparks-overlay-breaks
      "*:not(.MuiChip-root, .MuiChip-root *)": {
         backdropFilter: "grayscale(0)",
      },
   },
   cardContent: {
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      flex: 1,
      position: "relative",
   },
   cardDetails: {
      cursor: "pointer",
   },
   cardSelected: {
      opacity: 0.5,
   },
   carouselCard: {
      width: SPARK_DESKTOP_WIDTH,
   },
   carouselCardMobile: {
      width: SPARK_MOBILE_WIDTH,
   },
   galleryCard: {
      minWidth: SPARK_MOBILE_WIDTH,
   },
})

export type SparkPreviewCardType = "carousel" | "gallery" | "fullScreen"

type Props = {
   componentHeader?: React.ReactNode
   children?: React.ReactNode
   video: {
      thumbnailUrl: string
      url: string
      preview: boolean
      muted: boolean
   }
   onMouseEnter?: () => void
   onMouseLeave?: () => void
   onVideoEnded?: () => void
   autoPlaying?: boolean
   containerRef?: (node?: Element | null) => void
   selected?: boolean
   type?: SparkPreviewCardType
}

const SparkPreviewCardContainer: FC<Props> = ({
   componentHeader,
   children,
   video,
   onMouseEnter,
   onMouseLeave,
   onVideoEnded,
   autoPlaying,
   containerRef,
   selected,
   type = "carousel",
}) => {
   const isMobile = useIsMobile()

   const getCardStyles = (type: SparkPreviewCardType) => {
      if (type == "carousel") {
         return isMobile ? styles.carouselCardMobile : styles.carouselCard
      } else if (type == "gallery") {
         return styles.galleryCard
      }
      return null
   }

   const cardStyles = getCardStyles(type)

   return (
      <Box
         ref={containerRef}
         sx={[styles.root, selected && styles.cardSelected, cardStyles]}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}
         className="spark-preview-card-container"
      >
         {componentHeader ? componentHeader : null}
         <Box sx={styles.cardContent}>{children}</Box>
         <VideoPreview
            key={`${video.url}-${isMobile ? "mobile" : "desktop"}`}
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.url}
            pausing={!autoPlaying}
            playing={autoPlaying || video.preview}
            light={false}
            autoPlaying={autoPlaying}
            containPreviewOnTablet
            muted={video.muted}
            identifier={video.url}
            onVideoEnded={onVideoEnded}
         />
      </Box>
   )
}

export default SparkPreviewCardContainer
