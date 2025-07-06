import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Button,
   CircularProgress,
   Container,
   Grid,
   Typography,
} from "@mui/material"
import { useRouter } from "next/router"
import { ChevronRight } from "react-feather"
import { LivestreamSearchResult } from "types/algolia"
import { sxStyles } from "../../../../types/commonTypes"
import EventPreviewCard from "../stream-cards/EventPreviewCard"

const styles = sxStyles({
   section: {
      mt: 6,
      mb: 4,
   },
   header: {
      mb: 3,
   },
   title: {
      fontWeight: 600,
      color: "text.primary",
   },
   subtitle: {
      color: "text.secondary",
      mt: 1,
   },
   cardsContainer: {
      mb: 4,
   },
   moreButton: {
      display: "flex",
      justifyContent: "center",
      mt: 4,
   },
   button: {
      borderRadius: 2,
      px: 4,
      py: 1.5,
      textTransform: "none",
      fontWeight: 600,
      borderColor: "neutral.200",
      color: "neutral.600",
      "&:hover": {
         borderColor: "neutral.300",
         backgroundColor: "neutral.50",
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
         <Container maxWidth="xl" disableGutters>
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         </Container>
      )
   }

   if (!recentLivestreams.length) {
      return null
   }

   return (
      <Container maxWidth="xl" disableGutters>
         <Box sx={styles.section}>
            <Box sx={styles.header}>
               <Typography variant="h4" sx={styles.title}>
                  Recent live streams
               </Typography>
               <Typography variant="body1" sx={styles.subtitle}>
                  Catch up on what you missed
               </Typography>
            </Box>

            <Box sx={styles.cardsContainer}>
               <Grid container spacing={2} sx={{ margin: 1 }}>
                  {recentLivestreams.map((livestream, index) => (
                     <Grid
                        key={livestream.id}
                        xs={12}
                        md={6}
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
      </Container>
   )
}

export default RecentLivestreamsSection
