import Box from "@mui/material/Box"
import React, { FC } from "react"
import { sxStyles } from "types/commonTypes"
import VideoPreview from "./VideoPreview"

const styles = sxStyles({
   root: {
      color: "white",
      display: "flex",
      height: "100%",
      width: "100%",
      objectFit: "cover",
      borderRadius: 3,
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
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
})

type Props = {
   componentHeader?: React.ReactNode
   children?: React.ReactNode
   video: { thumbnailUrl: string; url: string; preview: boolean }
   onMouseEnter?: () => void
   onMouseLeave?: () => void
   autoPlaying?: boolean
   containerRef?: React.RefObject<HTMLDivElement>
}

const SparkCarouselCardContainer: FC<Props> = ({
   componentHeader,
   children,
   video,
   onMouseEnter,
   onMouseLeave,
   autoPlaying,
   containerRef,
}) => {
   const hoverEnabled = autoPlaying !== undefined

   return (
      <Box
         ref={containerRef}
         sx={styles.root}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}
      >
         {componentHeader ? componentHeader : null}
         <Box sx={styles.cardContent}>{children}</Box>
         <VideoPreview
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.url}
            playing={video.preview}
            light={hoverEnabled ? false : !video.preview}
            autoPlaying={autoPlaying}
            muted={hoverEnabled ? true : undefined}
         />
      </Box>
   )
}

export default SparkCarouselCardContainer
