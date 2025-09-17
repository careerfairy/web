import { Box, Stack, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { sxStyles } from "types/commonTypes"
import { OfflineEvent, OfflineEventCard } from "./OfflineEventCard"

const styles = sxStyles({
   wrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
   header: {
      pl: 2,
      pr: 2,
      mb: 1,
   },
   carouselContainer: {
      px: { xs: 2, md: 2 },
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

type Props = {
   title?: string
}

export const OfflineEvents = ({ title = "Offline events" }: Props) => {
   return (
      <Stack spacing={1.5} sx={styles.wrapper}>
         <ContentCarousel
            slideWidth={317}
            headerTitle={
               <Box sx={styles.header}>
                  <Typography
                     variant="brandedH4"
                     fontWeight={600}
                     color="neutral.800"
                  >
                     {title}
                  </Typography>
               </Box>
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
      </Stack>
   )
}
