import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Grid, Skeleton, Typography } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useMemo } from "react"
import { CheckCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import CardCustom from "../../common/CardCustom"
import { useMainPageContext } from "../MainPageProvider"
import { GoToLivestreamButton } from "./GoToLivestreamButton"
import { LivestreamChips } from "./LivestreamChips"
import { LivestreamStats } from "./LivestreamStats"

const styles = sxStyles({
   noLivestreamCopy: { color: (theme) => theme.palette.grey[500] },
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
   draftStatusText: {
      marginLeft: "auto",
      fontWeight: 600,
      fontSize: "0.813rem",
      color: (theme) => theme.palette.gold.main,
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
   const { isDraft, isCloseToLivestreamStart } = useNextLivestreamCardLogic()
   const { livestreamDialog } = useGroup()

   const onManageLivestream = useCallback(() => {
      livestream.isDraft = isDraft()
      livestreamDialog.handleEditStream(livestream)
   }, [isDraft, livestream, livestreamDialog])

   return (
      <Box textAlign="right" my={2}>
         {isDraft() ? (
            <Button
               color="secondary"
               variant="contained"
               onClick={onManageLivestream}
            >
               Manage your live stream
            </Button>
         ) : isCloseToLivestreamStart() ? (
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
   const { isDraft } = useNextLivestreamCardLogic()

   return (
      <Box display="flex" alignItems="center">
         <Typography sx={styles.cardTitleProps}>
            Your next live stream
         </Typography>

         {isDraft() ? <DraftStatus /> : <PublishedStatus />}
      </Box>
   )
}

const DraftStatus = () => {
   return <Typography sx={styles.draftStatusText}>Draft</Typography>
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
   const { livestreamDialog } = useGroup()
   return (
      <Box>
         <Typography mt={2} sx={styles.noLivestreamCopy} align="center">
            Looks like you don&apos;t have any upcoming live stream.
            <br />
            Start creating your next live stream now!
         </Typography>

         <Box mt={2} mb={3} display="flex" justifyContent="center">
            <Button
               color="secondary"
               variant="contained"
               onClick={() => livestreamDialog.handleOpenNewStreamModal()}
            >
               Create New Live Stream
            </Button>
         </Box>
      </Box>
   )
}
