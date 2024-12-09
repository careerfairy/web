import { Box } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import { HighlightComponentType } from "data/hygraph/types"
import { HighlightExpanded } from "./HighlightExpanded"
import { useHighlights } from "./HighlightsBlockContext"
import { ThumbnailCard } from "./ThumbnailCard"

type HighlightCardProps = {
   highlight: HighlightComponentType
   index: number
}

const HighlightCard = ({ highlight, index }: HighlightCardProps) => {
   const isDesktop = useIsDesktop()
   const {
      shouldAutoPlay,
      isExpanded,
      handleCloseCardClick,
      handleExpandCardClick,
      setAutoPlayingIndex,
      isLiveStreamDialogOpen,
   } = useHighlights()

   const { data: group, status } = useGroup(
      highlight?.companyIdentifier?.identifier
   )

   if (status === "error" || status === "loading") return null

   return (
      <>
         <Box
            onClick={handleExpandCardClick(index)}
            onMouseEnter={() => isDesktop && setAutoPlayingIndex(index)}
            onMouseLeave={() => isDesktop && setAutoPlayingIndex(undefined)}
         >
            <ThumbnailCard
               highlight={highlight}
               isPlaying={shouldAutoPlay(index)}
               group={group}
            />
         </Box>
         {isExpanded(index) && (
            <HighlightExpanded
               isPlaying={!isLiveStreamDialogOpen}
               highlight={highlight}
               group={group}
               onClose={handleCloseCardClick}
            />
         )}
      </>
   )
}

export default HighlightCard
