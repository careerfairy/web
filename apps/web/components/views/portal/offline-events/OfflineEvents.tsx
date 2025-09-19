import { Box, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { offlineEventService } from "data/firebase/OfflineEventService"
import useSWR from "swr"
import { sxStyles } from "types/commonTypes"
import { OfflineEventCard } from "./OfflineEventCard"

const styles = sxStyles({
   root: {
      pl: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
   carouselContainer: {
      position: "static",
   },
   headerRight: {
      pr: 2,
   },
})

export const OfflineEvents = () => {
   const { data: events } = useSWR(
      "offline-events",
      offlineEventService.getMany,
      {
         fallbackData: [],
      }
   )

   return (
      <Box sx={styles.root}>
         <ContentCarousel
            slideWidth={317}
            headerTitle={
               <Typography variant="brandedH4" fontWeight={600}>
                  Events near you
               </Typography>
            }
            containerSx={styles.carouselContainer}
            headerRightSx={styles.headerRight}
            disableArrows={false}
         >
            {events.map((event, index) => (
               <OfflineEventCard event={event} key={event.id + index} />
            ))}
         </ContentCarousel>
      </Box>
   )
}
