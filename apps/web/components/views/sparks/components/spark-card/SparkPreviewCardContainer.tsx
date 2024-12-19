import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import React, { FC } from "react"
import { sxStyles } from "types/commonTypes"
import VideoPreview from "./VideoPreview"

export const SPARK_DESKTOP_WIDTH = 232
export const SPARK_MOBILE_WIDTH = 200

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
      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         // Provides a gradient overlay at the top and bottom of the card to make the text more readable.
         background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0) 82.29%, rgba(0, 0, 0, 0.60) 100%)`,
         zIndex: -1,
      },
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
   video: { thumbnailUrl: string; url: string; preview: boolean }
   onMouseEnter?: () => void
   onMouseLeave?: () => void
   autoPlaying?: boolean
   containerRef?: React.RefObject<HTMLDivElement>
   selected?: boolean
   type?: SparkPreviewCardType
}

const SparkPreviewCardContainer: FC<Props> = ({
   componentHeader,
   children,
   video,
   onMouseEnter,
   onMouseLeave,
   autoPlaying,
   containerRef,
   selected,
   type = "carousel",
}) => {
   const isMobile = useIsMobile()
   const autoPlayEnabled = autoPlaying !== undefined && autoPlaying !== false

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
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.url}
            pausing={autoPlayEnabled ? !autoPlaying : undefined}
            playing={autoPlayEnabled ? autoPlaying : video.preview}
            light={false}
            autoPlaying={autoPlaying}
            containPreviewOnTablet
            muted={autoPlayEnabled ? true : undefined}
            identifier={video.url}
         />
      </Box>
   )
}

export default SparkPreviewCardContainer
