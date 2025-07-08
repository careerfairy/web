import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { ChevronRight } from "react-feather"
import { LivestreamSearchResult } from "types/algolia"
import { sxStyles } from "../../../../types/commonTypes"
import EventPreviewCard from "../stream-cards/EventPreviewCard"

const styles = sxStyles({
   section: {
      mt: 0, // Spacing handled by parent
   },
   header: {
      mb: 3, // 24px spacing between title and cards to match design
      pl: { xs: 2, md: 4 }, // 32px left padding on desktop to match other cards
   },
   title: {
      fontWeight: 600,
      fontSize: "1.5rem", // Match design typography
      color: "text.primary",
   },
   cardsContainer: {
      px: { xs: 2, md: 4 }, // 32px padding to match other sections
      width: "100%",
   },
   moreButton: {
      display: "flex",
      justifyContent: "center",
      px: { xs: 2, md: 4 }, // Match container padding
      pt: 4, // 32px top margin
      pb: 2, // 16px bottom margin
   },
   button: {
      borderRadius: "24px",
      height: "48px",
      maxWidth: "200px", // Limit button width as shown in design
      textTransform: "none",
      fontWeight: 600,
      borderColor: "neutral.200",
      color: "neutral.600",
      backgroundColor: "transparent",
      "&:hover": {
         borderColor: "neutral.300",
         backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      py: 4,
   },
})

type RecentLivestreamsSectionProps = {
   recentLivestreams: LivestreamSearchResult[]
   isLoading: boolean
}

const RecentLivestreamsSection = ({
   recentLivestreams,
   isLoading,
}: RecentLivestreamsSectionProps) => {
   const router = useRouter()

   const handleMoreToWatchClick = () => {
      void router.push("/past-livestreams")
   }

   if (isLoading) {
      return (
         <Box sx={styles.loader}>
            <CircularProgress />
         </Box>
      )
   }

   if (!recentLivestreams.length) {
      return null
   }

   return (
      <Box sx={styles.section}>
         <Box sx={styles.header}>
            <Typography variant="h4" sx={styles.title}>
               Recent live streams
            </Typography>
         </Box>

         <Box sx={styles.cardsContainer}>
            <Grid container spacing={3}>
               {recentLivestreams.map((livestream, index) => (
                  <Grid key={livestream.id} xs={12} sm={6} md={4} item>
                     <EventPreviewCard
                        event={{ ...livestream, triGrams: {} }}
                        location={ImpressionLocation.nextLivestreams}
                        index={index}
                        totalElements={recentLivestreams.length}
                     />
                  </Grid>
               ))}
            </Grid>
         </Box>

         <Box sx={styles.moreButton}>
            <Button
               variant="outlined"
               onClick={handleMoreToWatchClick}
               endIcon={<ChevronRight size={16} />}
               sx={styles.button}
            >
               More to watch
            </Button>
         </Box>
      </Box>
   )
}

export default RecentLivestreamsSection
