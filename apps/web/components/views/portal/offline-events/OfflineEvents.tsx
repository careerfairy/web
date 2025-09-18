import { Box, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { OfflineEvent, OfflineEventCard } from "./OfflineEventCard"
import { OfflineEventDialog } from "./OfflineEventDialog"

const styles = sxStyles({
   wrapper: {
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

const dummyEvents: OfflineEvent[] = [
   {
      id: "offline-1",
      bannerUrl: "/mockup/livestream.png",
      companyLogoUrl: "/logo_teal.svg",
      companyName: "Pwc",
      title: "Virtual Case Experience",
      location: "Kybunpark, St.Gallen",
      dateLabel: "07 August 2025",
   },
   {
      id: "offline-2",
      bannerUrl: "/mockup/engagement.jpg",
      companyLogoUrl: "/logo_white.svg",
      companyName: "Nestlé",
      title: "Graduate Networking Night",
      location: "Zurich, Switzerland",
      dateLabel: "21 September 2025",
   },
   {
      id: "offline-3",
      bannerUrl: "/sidebar.jpg",
      companyLogoUrl: "/logo_teal.svg",
      companyName: "UBS",
      title: "Meet the Team: Tech Open Day",
      location: "Basel, Switzerland",
      dateLabel: "05 October 2025",
   },
]

export const OfflineEvents = () => {
   const router = useRouter()

   const selectedEventId = useMemo(() => {
      const param = router.query.offlineEvent
      return Array.isArray(param) ? param[0] : param
   }, [router.query])

   const selectedEvent = useMemo(() => {
      return dummyEvents.find((e) => e.id === selectedEventId)
   }, [selectedEventId])

   const handleClose = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { offlineEvent, ...rest } = router.query
      void router.push(
         {
            pathname: router.pathname,
            query: rest,
         },
         undefined,
         { shallow: true, scroll: false }
      )
   }, [router])

   return (
      <Box sx={styles.wrapper}>
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
            {[...dummyEvents, ...dummyEvents, ...dummyEvents].map(
               (event, index) => (
                  <OfflineEventCard event={event} key={event.id + index} />
               )
            )}
         </ContentCarousel>
         <OfflineEventDialog
            open={Boolean(selectedEventId)}
            event={selectedEvent}
            onClose={handleClose}
         />
      </Box>
   )
}
