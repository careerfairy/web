import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { companyLogoPlaceholder } from "constants/images"
import { HighlightComponentType } from "data/hygraph/types"
import { useEffect, useRef } from "react"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"
import { HighlightVideoOverlay } from "./VideoOverlay"

const styles = sxStyles({
   card: {
      position: "relative",
      width: {
         xs: "100%",
         md: 220,
      },
      aspectRatio: 9 / 16,
      display: "flex",
      padding: "12px 8px",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      borderRadius: "8px",
      overflow: "hidden",
      gap: "8px",
      userSelect: "none",
      "& .react-player": {
         position: "absolute",
         top: 0,
         left: 0,
         zIndex: 0,
      },
   },
   header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      zIndex: 2,
      position: "absolute",
      bottom: "12px",
      left: 0,
      width: "100%",
      paddingX: 1,
   },
   logoContainer: {
      cursor: "pointer",
   },
   title: {
      color: (theme) => theme.brand.white["50"],
      textAlign: "center",
      fontSize: 14,
      fontWeight: 600,
      lineHeight: "20px",
      ...getMaxLineStyles(2),
   },
})

const ThumbnailHeader = ({
   group,
   highlight,
}: {
   group: Group
   highlight: HighlightComponentType
}) => {
   return (
      <Box sx={styles.header}>
         <Box sx={styles.logoContainer}>
            <CircularLogo
               src={group?.logoUrl || companyLogoPlaceholder}
               alt={`${group?.universityName} logo`}
            />
         </Box>
         <Typography variant="small" sx={styles.title}>
            {highlight.title}
         </Typography>
      </Box>
   )
}

type ThumbnailCardProps = {
   highlight: HighlightComponentType
   isPlaying: boolean
   onEnded: () => void
   group: Group
}

export const ThumbnailCard = ({
   highlight,
   isPlaying,
   onEnded,
   group,
}: ThumbnailCardProps) => {
   const playerRef = useRef<ReactPlayer>(null)

   useEffect(() => {
      if (!isPlaying && playerRef.current) {
         playerRef.current.seekTo(0)
      }
   }, [isPlaying])

   return (
      <Box sx={styles.card}>
         <ThumbnailHeader highlight={highlight} group={group} />
         <ReactPlayer
            ref={playerRef}
            url={highlight.videoClip.url}
            className="react-player"
            width="100%"
            height="100%"
            playing={isPlaying}
            muted
            playsinline
            onEnded={onEnded}
            preload="metadata"
            controls={false}
         />
         <HighlightVideoOverlay />
      </Box>
   )
}
