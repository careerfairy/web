import { Group } from "@careerfairy/shared-lib/groups"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { HighlightComponentType } from "data/hygraph/types"
import { SyntheticEvent, useState } from "react"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"
import { ExpandedCard } from "./ExpandedCard"
import { ExpandedHeader } from "./ExpandedHeader"
import { HighlightVideoOverlay } from "./VideoOverlay"

const styles = sxStyles({
   desktopHeaderContainer: {
      width: "100%",
   },
})

type Props = {
   isPlaying: boolean
   highlight: HighlightComponentType
   group: Group
   onClose: (event: SyntheticEvent) => void
}

export const HighlightExpanded = ({
   isPlaying,
   highlight,
   group,
   onClose,
}: Props) => {
   const isMobile = useIsMobile()
   const [isVideoReady, setIsVideoReady] = useState<boolean>(false)

   return (
      <ExpandedCard onClose={onClose}>
         <ReactPlayer
            url={highlight.videoClip.url}
            className="react-player"
            width="100%"
            height="100%"
            playing={isPlaying}
            playsinline
            loop
            onReady={() => setIsVideoReady(true)}
         />
         {Boolean(isVideoReady) && (
            <Box sx={!isMobile && styles.desktopHeaderContainer}>
               <ExpandedHeader highlight={highlight} group={group} />
               <HighlightVideoOverlay />
            </Box>
         )}
      </ExpandedCard>
   )
}
