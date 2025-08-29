import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Button, Grid, Skeleton, Typography } from "@mui/material"
import { useCallback, useMemo } from "react"
import { CheckCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import CardCustom from "../../common/CardCustom"
import { useLivestreamRouting } from "../../events/useLivestreamRouting"
import { useMainPageContext } from "../MainPageProvider"
import { GoToLivestreamButton } from "./GoToLivestreamButton"
import { LivestreamChips } from "./LivestreamChips"
import { LivestreamStats } from "./LivestreamStats"

const styles = sxStyles({
   card: {
      width: "100%",
   },
   cardContent: {
      paddingX: (theme) => theme.spacing(3),
      paddingTop: 0,
   },
   cardEmpty: {
      "& .MuiCardContent-root": {
         height: "100%",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
      },
   },
   cardCustom: {
      ".MuiCardContent-root": {
         height: "80%",
         paddingBottom: 0,
         display: "flex",
         flexDirection: "column",
      },
   },
   cardTitleTypographyProps: {
      fontWeight: 500,
   },
   cardHeader: {
      paddingX: (theme) => theme.spacing(3),
      paddingBottom: (theme) => theme.spacing(1),
   },
   cardTitleProps: {
      fontWeight: 400,
      fontSize: "0.929rem",
      color: (t) => t.palette.grey[600],
      paddingTop: (t) => t.spacing(1),
   },
   publishedStatusText: {
      marginLeft: "auto",
      fontWeight: 600,
      fontSize: "0.813rem",
      color: (theme) => theme.palette.primary.main,
   },
   publishedStatusIcon: {
      color: "#00d2aa",
      marginLeft: "5px",
   },
   title: {
      fontWeight: 600,
      fontSize: "1.714rem",
   },
   date: {
      fontWeight: 400,
      fontSize: "1.071rem",
   },
   buttonManage: {
      border: "none",
      textTransform: "none",
      "&:hover": {
         border: "none",
      },
   },
   noLivestreamsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      px: 2,
      pb: 2,
      height: "100%",
   },
   noLivestreamsCard: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "8px",
      px: 1,
      py: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 2,
      flex: 1,
   },
   noLivestreamsTitle: {
      color: "neutral.800",
      fontWeight: 600,
   },
   noLivestreamsSubtitle: {
      color: "neutral.800",
      fontWeight: 400,
   },

})

export const useNextLivestreamCardLogic = () => {
   const { nextLivestream } = useMainPageContext()

   const noLivestreams = useCallback(() => {
      return nextLivestream === null
   }, [nextLivestream])

   const isLoading = useCallback(() => {
      return nextLivestream === undefined
   }, [nextLivestream])

   const livestream = useMemo(() => {
      return nextLivestream
   }, [nextLivestream])

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
         isCloseToLivestreamStart,
      }),
      [isCloseToLivestreamStart, isLoading, livestream, noLivestreams]
   )
}

export const NextLivestreamCard = () => {
   const { noLivestreams, isLoading, livestream } = useNextLivestreamCardLogic()

   if (isLoading()) {
      return <LoadingSkeleton />
   }

   if (noLivestreams()) {
      return (
         <CardCustom title={undefined} sx={styles.cardEmpty}>
            <NoLivestreams />
         </CardCustom>
      )
   }

   return (
      <CardCustom sx={styles.cardCustom} title={<TitleBar />}>
         <LivestreamDetails livestream={livestream} />
      </CardCustom>
   )
}

const LivestreamDetails = ({ livestream }: { livestream: LivestreamEvent }) => {
   return (
      <>
         <Box sx={{ flex: 1 }}>
            <Box display="flex" mt={2}>
               <Typography sx={styles.date}>
                  {livestream.start
                     ? DateUtil.eventPreviewDate(livestream.start.toDate())
                     : "Future Date"}
               </Typography>
            </Box>
            <Box mt={1}>
               <Typography variant="h5" sx={styles.title}>
                  {livestream.title?.length > 0
                     ? livestream.title
                     : "Untitled Live Stream"}
               </Typography>
            </Box>

            <LivestreamStats livestream={livestream} />
            <LivestreamChips livestream={livestream} />
         </Box>
         <Box sx={{ flex: "none" }}>
            <Actions livestream={livestream} />
         </Box>
      </>
   )
}

const Actions = ({ livestream }: { livestream: LivestreamEvent }) => {
   const { isCloseToLivestreamStart } = useNextLivestreamCardLogic()
   const { editLivestream } = useLivestreamRouting()

   const onManageLivestream = useCallback(() => {
      livestream.isDraft = false
      return editLivestream(livestream.id)
   }, [livestream, editLivestream])

   return (
      <Box textAlign="right" my={2}>
         {isCloseToLivestreamStart() ? (
            <>
               <Button
                  color="secondary"
                  variant="outlined"
                  sx={styles.buttonManage}
                  onClick={onManageLivestream}
               >
                  Manage your live stream
               </Button>
               <GoToLivestreamButton livestreamId={livestream.id} />
            </>
         ) : (
            <Button
               color="secondary"
               variant="contained"
               onClick={onManageLivestream}
            >
               Manage your live stream
            </Button>
         )}
      </Box>
   )
}

const TitleBar = () => {
   return (
      <Box display="flex" alignItems="center">
         <Typography sx={styles.cardTitleProps}>
            Your next live stream
         </Typography>

         <PublishedStatus />
      </Box>
   )
}



const PublishedStatus = () => {
   return (
      <>
         <Typography sx={styles.publishedStatusText}>Published</Typography>
         <CheckCircle style={styles.publishedStatusIcon} width={16} />
      </>
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
      <Box sx={styles.noLivestreamsContainer}>
         <Box sx={styles.noLivestreamsCard}>
            <Typography variant="medium" sx={styles.noLivestreamsTitle}>
               No upcoming live streams
            </Typography>
            
            <Typography variant="medium" sx={styles.noLivestreamsSubtitle}>
               Schedule your next live stream to engage your audience. Once published it will appear here.
            </Typography>

            <LoadingButton
               variant="contained"
               color="secondary"
               onClick={createDraftLivestream}
               loading={isCreating}
            >
               Schedule a live stream
            </LoadingButton>
         </Box>
      </Box>
   )
}
