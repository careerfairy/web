import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Button,
   CircularProgress,
   Grid,
   Typography
} from "@mui/material"
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
      mb: 2, // 16px spacing between title and cards
   },
   title: {
      fontWeight: 600,
      color: "text.primary",
   },
   cardsContainer: {
      p: { xs: 0, md: 2 }, // Match main grid padding
      width: "100%",
   },
   moreButton: {
      m: 4, // 32px margins on all sides
   },
   button: {
      borderRadius: "24px",
      height: "48px",
      width: "100%",
      textTransform: "none",
      fontWeight: 600,
      borderColor: "neutral.200",
      color: "neutral.600",
      backgroundColor: "transparent",
      "&:hover": {
         borderColor: "neutral.300",
         backgroundColor: "transparent",
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
            <Grid container spacing={2}>
               {recentLivestreams.map((livestream, index) => (
                  <Grid
                     key={livestream.id}
                     xs={12}
                     lsCardsGallery={6}
                     lg={4}
                     xl={3}
                     item
                  >
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
