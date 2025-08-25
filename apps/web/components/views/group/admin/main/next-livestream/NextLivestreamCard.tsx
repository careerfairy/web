import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Grid, Skeleton, Typography } from "@mui/material"
import { useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"
import { useLivestreamRouting } from "../../events/useLivestreamRouting"
import { useMainPageContext } from "../MainPageProvider"

const styles = sxStyles({
   noLivestreamContainer: {
      backgroundColor: theme => theme.brand.white?.[300] || "#FAFAFE",
      borderRadius: "12px",
      p: 3,
      textAlign: "center",
   },
   noLivestreamTitle: {
      color: "neutral.800",
      fontSize: "16px",
      fontWeight: 600,
      lineHeight: "24px",
      mb: 1,
   },
   noLivestreamSubtitle: {
      color: "neutral.800", 
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      mb: 3,
   },
   scheduleButton: {
      backgroundColor: "secondary.600", // Purple 600
      color: theme => theme.brand.white?.[50] || "#FFFFFF", // White 50
      borderRadius: "8px",
      px: 3,
      py: 1.5,
      textTransform: "none",
      "&:hover": {
         backgroundColor: "secondary.700", // Purple 700
      },
   },
})

export const useNextLivestreamCardLogic = () => {
   const { nextDraft, nextLivestream } = useMainPageContext()

   const noLivestreams = useCallback(() => {
      return nextDraft === null && nextLivestream === null
   }, [nextLivestream, nextDraft])

   const isLoading = useCallback(() => {
      return nextDraft === undefined || nextLivestream === undefined
   }, [nextDraft, nextLivestream])

   const isDraft = useCallback(() => {
      if (nextDraft && !nextLivestream) {
         return true
      }

      if (
         nextDraft &&
         nextDraft.start.toDate() > new Date() && // is a future date
         nextDraft.start.toDate() < nextLivestream.start.toDate() // draft is sonner than the livestream
      ) {
         return true
      }

      return false
   }, [nextDraft, nextLivestream])

   const livestream = useMemo(() => {
      return isDraft() ? nextDraft : nextLivestream
   }, [isDraft, nextDraft, nextLivestream])

   /**
    * Checks if the livestream is about to start
    * if so, we display different actions
    */
   const isCloseToLivestreamStart = useCallback(() => {
      if (nextLivestream) {
         const startDateMs = nextLivestream.start?.toDate?.().getTime()
         const diffMs = 60 * 60 * 1000 // 1 hour

         return startDateMs ? startDateMs - Date.now() <= diffMs : false
      }
      return false
   }, [nextLivestream])

   return useMemo(
      () => ({
         livestream,
         noLivestreams,
         isLoading,
         isDraft,
         isCloseToLivestreamStart,
      }),
      [isCloseToLivestreamStart, isDraft, isLoading, livestream, noLivestreams]
   )
}

export const NextLivestreamCard = () => {
   const { noLivestreams, isLoading, livestream } = useNextLivestreamCardLogic()

   if (isLoading()) {
      return <LoadingSkeleton />
   }

   if (noLivestreams()) {
      return <NoLivestreams />
   }

   // TODO: Implement new upcoming livestream variant
   // For now, return a placeholder until the new variant is implemented
   return (
      <Box sx={{ p: 3, textAlign: "center" }}>
         <Typography variant="h6">Upcoming livestream variant coming soon</Typography>
         <Typography color="text.secondary" mt={1}>
            Livestream: {livestream.title || "Untitled"}
         </Typography>
      </Box>
   )
}



const LoadingSkeleton = () => {
   return (
      <CardCustom title={undefined}>
         <Grid container spacing={2}>
            <Grid item xs={8}>
               <Skeleton variant="text" height={40} />
            </Grid>
            <Grid item xs={4} justifyContent="end" textAlign={"right"}>
               <Skeleton variant="text" height={40} />
            </Grid>

            <Grid item xs={12}>
               <Skeleton variant="text" height={200} />
            </Grid>

            <Grid item xs={12}>
               <Skeleton variant="text" height={40} />
            </Grid>
         </Grid>
      </CardCustom>
   )
}

const NoLivestreams = () => {
   const { createDraftLivestream, isCreating } = useLivestreamRouting()
   return (
      <Box sx={styles.noLivestreamContainer}>
         <Typography sx={styles.noLivestreamTitle}>
            No upcoming live streams
         </Typography>

         <Typography sx={styles.noLivestreamSubtitle}>
            Schedule your next live stream to engage your audience. Once published it will appear here.
         </Typography>

         <LoadingButton
            sx={styles.scheduleButton}
            onClick={createDraftLivestream}
            loading={isCreating}
            variant="contained"
         >
            Schedule a live stream
         </LoadingButton>
      </Box>
   )
}
