import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { LoadingButton } from "@mui/lab"
import { Box, Grid, Skeleton, Typography, Stack, CardActionArea, Button } from "@mui/material"
import { useCallback, useMemo } from "react"
import { User, BarChart, MessageCircle, Share, Video } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useFirestoreDocument } from "components/custom-hook/utils/useFirestoreDocument"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useGroup } from "layouts/GroupDashboardLayout"
import { totalPeopleReachedByLivestreamStat } from "../../common/util"
import CircularLogo from "../../common/logos/CircularLogo"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import CardCustom from "../../common/CardCustom"
import { useLivestreamRouting } from "../../events/useLivestreamRouting"
import { useMainPageContext } from "../MainPageProvider"
import { GoToLivestreamButton } from "./GoToLivestreamButton"

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
   // Upcoming livestream variant styles (based on EventPreviewCard)
   upcomingCardWrapper: (theme) => ({
      borderRadius: theme.spacing(2),
      border: `1px solid ${theme.palette.secondary[50]}`,
      overflow: "hidden",
      background: theme.brand.white[50],
      "&:hover, &:focus-within": {
         background: theme.brand.white[100],
         borderColor: theme.palette.secondary[100],
         boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      },
   }),
   upcomingCardContent: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      padding: "0px 16px 16px 16px",
      justifyContent: "flex-end",
      alignItems: "flex-start",
   },
   heroSection: {
      filter: "brightness(75%)",
      display: "flex",
      height: "112px",
      width: "100%",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
   },
   backgroundImage: {
      position: "absolute",
      inset: 0,
      height: "auto",
      width: "100%",
      objectFit: "cover",
      transition: "transform 0.3s ease",
   },
   headerWrapper: {
      display: "flex",
      width: "100%",
      gap: "8px",
      marginTop: "-12px",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      flex: "1 0 0",
      flexDirection: "column",
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 600,
      overflow: "hidden",
   },
   companyName: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%",
   },
   descriptionWrapper: {
      justifyContent: "space-between",
      alignItems: "flex-start",
      alignSelf: "stretch",
      height: "136px",
   },
   title: {
      height: "48px",
      fontWeight: 600,
      ...getMaxLineStyles(2),
   },
   summary: {
      fontWeight: 400,
      lineHeight: "20px",
      ...getMaxLineStyles(2),
   },
   metricsSection: {
      backgroundColor: theme => theme.brand.black?.[100] || "#FAFAFA",
      borderRadius: "12px",
      p: 2,
      mt: 2,
   },
   metricsRow: {
      display: "flex",
      gap: 2,
      mb: 2,
   },
   metricItem: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 1,
      p: 1,
   },
   metricIcon: {
      width: 16,
      height: 16,
      color: "secondary.main",
   },
   metricContent: {
      display: "flex",
      flexDirection: "column",
   },
   metricLabel: {
      fontSize: "12px",
      fontWeight: 400,
      color: "neutral.500",
      lineHeight: "16px",
   },
   metricValue: {
      fontSize: "14px",
      fontWeight: 600,
      color: "text.primary",
      lineHeight: "20px",
   },
   buttonsRow: {
      display: "flex",
      gap: 1,
      mt: 2,
   },
   shareButton: {
      flex: 1,
      border: 1,
      borderColor: "neutral.300",
      borderRadius: "8px",
      py: 1,
      px: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      backgroundColor: "transparent",
      textTransform: "none",
      "&:hover": {
         backgroundColor: "neutral.50",
      },
   },
   shareButtonText: {
      fontSize: "12px",
      fontWeight: 400,
      color: "neutral.600",
   },
   enterRoomButton: {
      flex: 1,
      backgroundColor: "secondary.main",
      borderRadius: "8px",
      py: 1,
      px: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      textTransform: "none",
      "&:hover": {
         backgroundColor: "secondary.dark",
      },
   },
   enterRoomButtonText: {
      fontSize: "12px",
      fontWeight: 400,
      color: "common.white",
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

   return <UpcomingLivestreamVariant livestream={livestream} />
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
