import { Stack, Theme, Typography, useMediaQuery } from "@mui/material"
import { useUpcomingPanelEventsSWR } from "components/custom-hook/panels/useUpcomingPanelEventsSWR"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import { RectanglePanelCard } from "components/views/panels/cards/RectanglePanelCard"
import { SmallPanelCard } from "components/views/panels/cards/SmallPanelCard"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.white[200],
      p: 1.5,
      borderRadius: 2,
      border: (theme) => `1px solid ${theme.brand.purple[50]}`,
      width: "100%",
      overflow: "hidden",
   },
   panelCardWrapper: {
      display: "flex",
      justifyContent: "center",
   },
   rectanglePanelCard: {
      minWidth: "365px",
   },
})

export const PanelsSection = () => {
   const { data: panels } = useUpcomingPanelEventsSWR()

   const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down(989))

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
         dragFree: true,
         skipSnaps: true,
      },
      [WheelGesturesPlugin()]
   )

   if (!panels?.length) {
      return null
   }

   return (
      <Stack spacing={1} sx={styles.root}>
         <Typography
            variant={isMobile ? "small" : "medium"}
            fontWeight={600}
            color="neutral.800"
         >
            Discover new panels
         </Typography>

         <GenericCarousel
            emblaRef={emblaRef}
            emblaApi={emblaApi}
            gap="8px"
            preventEdgeTouch
            sx={{
               overflow: "visible",
            }}
         >
            {panels.map((panel) => {
               return (
                  <GenericCarousel.Slide key={panel.id}>
                     {isMobile ? (
                        <SmallPanelCard event={panel} />
                     ) : (
                        <RectanglePanelCard
                           event={panel}
                           contentSx={styles.rectanglePanelCard}
                        />
                     )}
                  </GenericCarousel.Slide>
               )
            })}
         </GenericCarousel>
      </Stack>
   )
}
