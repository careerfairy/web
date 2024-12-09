import { Group } from "@careerfairy/shared-lib/groups"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { HighlightComponentType } from "data/hygraph/types"
import { SyntheticEvent } from "react"
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
   onEnded: () => void
   onClose: (event: SyntheticEvent) => void
}

const Mobile = ({ isPlaying, highlight, group, onEnded }: Props) => (
   <>
      <ExpandedHeader highlight={highlight} group={group} />
      <ReactPlayer
         className="react-player"
         width="100%"
         height="100%"
         url={highlight.videoClip.url}
         playing={isPlaying}
         onEnded={onEnded}
         playsinline
      />
      <HighlightVideoOverlay />
   </>
)

const Desktop = ({ isPlaying, highlight, group, onEnded }: Props) => (
   <>
      <ReactPlayer
         url={highlight.videoClip.url}
         className="react-player"
         width="100%"
         height="100%"
         playing={isPlaying}
         onEnded={onEnded}
         playsinline
      />
      <Box sx={styles.desktopHeaderContainer}>
         <ExpandedHeader highlight={highlight} group={group} />
         <HighlightVideoOverlay />
      </Box>
   </>
)

export const HighlightExpanded = (props: Props) => {
   const isMobile = useIsMobile()
   return (
      <ExpandedCard onClose={props.onClose}>
         {isMobile ? <Mobile {...props} /> : <Desktop {...props} />}
      </ExpandedCard>
   )
}
