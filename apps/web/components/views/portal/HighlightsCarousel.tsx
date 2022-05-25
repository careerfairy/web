import React, { useMemo, useState } from "react"
import HighlightItem from "./HighlightItem"
import HighlightVideoDialog from "./HighlightVideoDialog"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { HighLight } from "../../../types/Highlight"
import CustomButtonCarousel from "../common/carousels/CustomButtonCarousel"
import useCanWatchHighlights from "../../custom-hook/useCanWatchHighlights"

const styles = {
   root: {
      pt: { xs: 1, md: 4 },
   },
}
const HighlightsCarousel = ({
   serverSideHighlights,
   showHighlights,
}: Props) => {
   const {
      breakpoints: { up },
   } = useTheme()
   const [highlights] = useState<HighLight[]>(serverSideHighlights)
   const isExtraSmall = useMediaQuery(up("xs"))
   const isSmall = useMediaQuery(up("sm"))
   const isMedium = useMediaQuery(up("md"))
   const isLarge = useMediaQuery(up("lg"))
   const {
      setUserTimeoutWithCookie,
      checkIfCanWatchHighlight,
      timoutDuration,
      canWatchAllHighlights,
   } = useCanWatchHighlights()
   const numSlides: number = useMemo(() => {
      return isLarge ? 5 : isMedium ? 4 : isSmall ? 3 : 1
   }, [isExtraSmall, isSmall, isMedium, isLarge])

   const [videoUrl, setVideoUrl] = useState(null)

   const handleOpenVideoDialog = (videoUrl: string) => {
      const { canWatchAll, timeLeft } = checkIfCanWatchHighlight()
      if (canWatchAll) {
         setVideoUrl(videoUrl)
         setUserTimeoutWithCookie()
      } else {
         if (videoUrl) handleCloseVideoDialog()
         alert(
            `You can only watch highlights once per ${
               timoutDuration / 1000
            } seconds. You have ${Math.round(timeLeft / 1000)} seconds left.`
         )
      }
   }

   const handleCloseVideoDialog = () => {
      setVideoUrl(null)
   }
   if (!showHighlights || !highlights?.length) {
      return null
   }

   return (
      <Box sx={styles.root}>
         <CustomButtonCarousel
            numChildren={highlights.length}
            numSlides={numSlides}
            carouselProps={{
               autoPlay: true,
            }}
         >
            {highlights.map((highlight) => (
               <Box key={highlight.id}>
                  <HighlightItem
                     handleOpenVideoDialog={handleOpenVideoDialog}
                     highLight={highlight}
                     canWatchAllHighlights={canWatchAllHighlights}
                  />
               </Box>
            ))}
         </CustomButtonCarousel>
         {videoUrl && (
            <HighlightVideoDialog
               videoUrl={videoUrl}
               handleClose={handleCloseVideoDialog}
            />
         )}
      </Box>
   )
}

interface Props {
   serverSideHighlights: HighLight[]
   showHighlights: Boolean
}

export default HighlightsCarousel
