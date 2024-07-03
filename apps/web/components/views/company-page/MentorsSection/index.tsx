// @ts-ignore
import { Box, IconButton, Typography } from "@mui/material"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useMemo } from "react"
import { ArrowLeft, ArrowRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useCompanyPage } from ".."
import MentorCard from "./MentorCard"

const styles = sxStyles({
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   container: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 2,
      touchAction: "pan-y",
      backfaceVisibility: "hidden",
   },
   viewport: {
      overflow: "hidden",
   },
})

const MentorsSection = () => {
   const { editMode, groupCreators } = useCompanyPage()

   const isDesktop = useIsDesktop()

   const emblaOptions = useMemo<EmblaOptionsType>(
      () => ({
         axis: "x",
      }),
      []
   )

   const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [
      WheelGesturesPlugin(),
   ])

   if (!groupCreators.length) return null

   return (
      <Box>
         <Box sx={styles.titleSection}>
            <Typography variant="h4" fontWeight={"600"} color="black" mb={1}>
               Mentors
            </Typography>
            {Boolean(isDesktop) && (
               <Box>
                  <IconButton
                     color="inherit"
                     sx={styles.arrowIcon}
                     onClick={() => {
                        if (emblaApi.canScrollPrev()) emblaApi.scrollPrev()
                     }}
                  >
                     <ArrowLeft fontSize={"large"} />
                  </IconButton>
                  <IconButton
                     color="inherit"
                     sx={styles.arrowIcon}
                     onClick={() => {
                        if (emblaApi.canScrollNext()) emblaApi.scrollNext()
                     }}
                  >
                     <ArrowRight fontSize={"large"} />
                  </IconButton>
               </Box>
            )}
         </Box>
         <Box ref={emblaRef} sx={styles.viewport}>
            <Box sx={styles.container}>
               {groupCreators.map((creator) => (
                  <MentorCard
                     key={`mentor-slide-box-${creator.id}`}
                     creator={creator}
                     isEditMode={editMode}
                  />
               ))}
            </Box>
         </Box>
      </Box>
   )
}

export default MentorsSection
