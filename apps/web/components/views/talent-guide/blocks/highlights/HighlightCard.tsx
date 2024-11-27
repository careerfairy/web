import { Box } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import useIsMobile from "components/custom-hook/useIsMobile"
import { HighlightComponentType } from "data/hygraph/types"
import { ExpandedDesktop, ExpandedMobile } from "./ExpandedCard"
import { useHighlights } from "./HighlightsBlockContext"
import { ThumbnailCard } from "./ThumbnailCard"

type HighlightCardProps = {
   highlight: HighlightComponentType
   index: number
}

const HighlightCard = ({ highlight, index }: HighlightCardProps) => {
   const isMobile = useIsMobile()
   const {
      shouldAutoPlay,
      handleEndedPlaying,
      isExpanded,
      handleCloseCardClick,
      handleExpandCardClick,
      setAutoPlayingIndex,
   } = useHighlights()

   const { data: group, status } = useGroup(
      highlight?.companyIdentifier?.identifier
   )

   if (status === "error" || status === "loading") return null

   return (
      <>
         <Box
            onClick={handleExpandCardClick(index)}
            onMouseEnter={() => setAutoPlayingIndex(index)}
            onMouseLeave={() => setAutoPlayingIndex(null)}
         >
            <ThumbnailCard
               highlight={highlight}
               isPlaying={shouldAutoPlay(index)}
               onEnded={handleEndedPlaying}
               group={group}
            />
         </Box>
         {isExpanded(index) && (
            <>
               {Boolean(isMobile) && (
                  <ExpandedMobile
                     highlight={highlight}
                     group={group}
                     onEnded={handleEndedPlaying}
                     onClose={handleCloseCardClick}
                  />
               )}
               {Boolean(!isMobile) && (
                  <Box sx={{ display: "none" }}>
                     <ExpandedDesktop
                        highlight={highlight}
                        group={group}
                        onEnded={handleEndedPlaying}
                        onClose={handleCloseCardClick}
                     />
                  </Box>
               )}
            </>
         )}
      </>
   )
}

export default HighlightCard
