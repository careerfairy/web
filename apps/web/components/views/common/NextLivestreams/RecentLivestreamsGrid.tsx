import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Grid, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { InView } from "react-intersection-observer"
import { sxStyles } from "../../../../types/commonTypes"
import { useRecentLivestreams } from "../../../custom-hook/live-stream/useRecentLivestreams"
import EventPreviewCard from "../stream-cards/EventPreviewCard"

const styles = sxStyles({
   container: {
      mt: 4,
      mb: 2,
   },
   title: {
      mb: 3,
      fontWeight: 600,
   },
   grid: {
      mb: 3,
   },
   button: {
      display: "flex",
      justifyContent: "center",
      mt: 2,
   },
})

const RecentLivestreamsGrid = () => {
   const router = useRouter()
   const { data: recentLivestreams, isLoading } = useRecentLivestreams(9)

   const handleMoreToWatchClick = () => {
      router.push("/past-livestreams")
   }

   if (isLoading || !recentLivestreams?.length) {
      return null
   }

   return (
      <Box sx={styles.container}>
         <Typography variant="h4" sx={styles.title}>
            Recent live streams
         </Typography>
         
         <Grid container spacing={2} sx={styles.grid}>
            {recentLivestreams.map((livestream, index) => (
               <Grid key={livestream.id} item xs={12} sm={6} md={4}>
                  <InView triggerOnce>
                     {({ inView, ref }) =>
                        inView ? (
                           <EventPreviewCard
                              ref={ref}
                              index={index}
                              totalElements={recentLivestreams.length}
                              location={ImpressionLocation.nextLivestreams}
                              event={livestream}
                              disableAutoPlay={true}
                           />
                        ) : (
                           <EventPreviewCard ref={ref} loading />
                        )
                     }
                  </InView>
               </Grid>
            ))}
         </Grid>

         <Box sx={styles.button}>
            <Button
               variant="outlined"
               color="primary"
               onClick={handleMoreToWatchClick}
               size="large"
            >
               More to watch
            </Button>
         </Box>
      </Box>
   )
}

export default RecentLivestreamsGrid