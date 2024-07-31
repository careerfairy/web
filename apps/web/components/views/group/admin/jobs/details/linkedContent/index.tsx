import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Button, Stack, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useCustomJobLinkedSparks from "components/custom-hook/custom-job/useCustomJobLinkedSparks"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useGroup } from "layouts/GroupDashboardLayout"
import {
   Dispatch,
   SetStateAction,
   useCallback,
   useMemo,
   useRef,
   useState,
} from "react"
import { Edit2 } from "react-feather"
import { useDispatch } from "react-redux"
import { setSparkToPreview } from "store/reducers/adminSparksReducer"
import { sxStyles } from "types/commonTypes"
import LinkedContentDialog from "./LinkedContentDialog"
import LinkedContentFormProvider from "./LinkedContentFormProvider"
import PendingContent from "./PendingContent"

const styles = sxStyles({
   subTitle: {
      fontSize: { xs: "16px", md: "18px" },
      fontWeight: 600,
   },
   linkedContentWrapper: {
      mt: 2,
   },
   viewport: {
      overflow: "hidden",
   },
   slide: {
      flex: {
         xs: `0 0 90%`,
         sm: `0 0 45%`,
         md: `0 0 40%`,
         lg: `0 0 30%`,
      },
      maxWidth: { md: 360 },
      height: {
         xs: 355,
         md: 355,
      },

      "&:not(:first-of-type)": {
         ml: `15px`,
      },
      "&:first-of-type": {
         ml: 0.3,
      },
   },
   wrapper: {
      p: 3,
      borderRadius: "15px",
      background: (theme) => theme.palette.common.white,
   },
   header: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
   },
   editBtn: {
      width: "8px",
      height: "8px",
      borderRadius: "20px",
   },
})

const defaultStyling: EventsCarouselStyling = {
   compact: true,
   viewportSx: styles.viewport,
   slide: styles.slide,
}

const sparksCarouselEmblaOptions: EmblaOptionsType = {
   align: "start",
}

type Props = {
   job: CustomJob
}

export type EditDialogState = {
   open: boolean
   step?: number
   editMode?: boolean
}

export type LiveStreamDialogState = {
   open: boolean
   livestreamId?: string
}

const LinkedContent = ({ job }: Props) => {
   const { group } = useGroup()
   const [editDialogState, setEditDialogState] = useState<EditDialogState>({
      open: false,
   })
   const [livestreamDialog, setLivestreamDialog] =
      useState<LiveStreamDialogState>({ open: false })
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(
      group.groupId
   )
   //    // const { jobHubV1 } = useFeatureFlags()
   const { jobHubV1 } = { jobHubV1: true }

   const jobHasNoContent = useMemo(
      () =>
         jobHubV1
            ? Boolean(job.livestreams.length == 0 && job.sparks.length == 0)
            : false,
      [job.livestreams.length, job.sparks.length, jobHubV1]
   )

   const linkJobToContentClick = useCallback(() => {
      setEditDialogState({
         open: true,
         step: groupHasUpcomingLivestreams ? 0 : 1,
      })
   }, [groupHasUpcomingLivestreams])

   const handleClose = useCallback(() => {
      setEditDialogState({ open: false })
   }, [])

   return (
      <>
         {jobHasNoContent ? (
            <PendingContent handleClick={linkJobToContentClick} />
         ) : (
            <Box sx={styles.wrapper}>
               <Stack spacing={2}>
                  <SuspenseWithBoundary fallback={<></>}>
                     <LiveStreamsContent
                        job={job}
                        setEditDialogState={setEditDialogState}
                        setLiveStreamDialog={setLivestreamDialog}
                     />
                  </SuspenseWithBoundary>

                  <SuspenseWithBoundary fallback={<></>}>
                     <SparksContent
                        job={job}
                        setEditDialogState={setEditDialogState}
                     />
                  </SuspenseWithBoundary>
               </Stack>
            </Box>
         )}

         <LinkedContentFormProvider job={job}>
            <LinkedContentDialog
               job={job}
               dialogState={editDialogState}
               handleClose={handleClose}
            />
         </LinkedContentFormProvider>

         <LivestreamDialog
            open={livestreamDialog.open}
            livestreamId={livestreamDialog.livestreamId || ""}
            handleClose={() => setLivestreamDialog({ open: false })}
            page={"details"}
            serverUserEmail={group.adminEmail}
         />
      </>
   )
}

type ContentProps = {
   job: CustomJob
   setEditDialogState: Dispatch<SetStateAction<EditDialogState>>
   setLiveStreamDialog?: Dispatch<SetStateAction<LiveStreamDialogState>>
}
const LiveStreamsContent = ({
   job,
   setEditDialogState,
   setLiveStreamDialog,
}: ContentProps) => {
   const linkedLivestreams = useCustomJobLinkedLivestreams(job)
   const isMobile = useIsMobile()

   const handleEditLiveStreams = useCallback(() => {
      setEditDialogState({ open: true, step: 0, editMode: true })
   }, [setEditDialogState])

   const handleCardClick = useCallback(
      (event: LivestreamEvent) => {
         setLiveStreamDialog({ open: true, livestreamId: event.id })
      },
      [setLiveStreamDialog]
   )

   return linkedLivestreams.length > 0 ? (
      <>
         <Box sx={styles.header}>
            <Typography variant={"subtitle1"} sx={styles.subTitle}>
               Live streams related to this job
            </Typography>

            {isMobile ? (
               <Edit2 color="grey" size={18} onClick={handleEditLiveStreams} />
            ) : (
               <Button
                  variant="outlined"
                  color="grey"
                  startIcon={<Edit2 color="grey" />}
                  onClick={handleEditLiveStreams}
               >
                  Edit
               </Button>
            )}
         </Box>

         <Box sx={styles.linkedContentWrapper}>
            <EventsPreviewCarousel
               id={"job-events"}
               type={EventsTypes.JOB_EVENTS}
               events={linkedLivestreams}
               isEmbedded
               styling={defaultStyling}
               onCardClick={handleCardClick}
            />
         </Box>
      </>
   ) : null
}

const SparksContent = ({ job, setEditDialogState }: ContentProps) => {
   const childRef = useRef(null)
   const isMobile = useIsMobile()
   const dispatch = useDispatch()

   const linkedSparks = useCustomJobLinkedSparks(job)

   const handleSparkClick = useCallback(
      (spark: Spark) => {
         dispatch(setSparkToPreview(spark.id))
      },
      [dispatch]
   )

   const handleEditSparks = useCallback(() => {
      setEditDialogState({ open: true, step: 1, editMode: true })
   }, [setEditDialogState])

   return linkedSparks.length > 0 ? (
      <>
         <Box sx={styles.header}>
            <Typography variant={"subtitle1"} sx={styles.subTitle}>
               Sparks related to this job
            </Typography>

            {isMobile ? (
               <Edit2 color="grey" size={18} onClick={handleEditSparks} />
            ) : (
               <Button
                  variant="outlined"
                  color="grey"
                  startIcon={<Edit2 color="grey" />}
                  onClick={handleEditSparks}
               >
                  Edit
               </Button>
            )}
         </Box>

         <Box sx={styles.linkedContentWrapper}>
            <SparksCarousel
               ref={childRef}
               sparks={linkedSparks}
               options={sparksCarouselEmblaOptions}
               onSparkClick={handleSparkClick}
            />
         </Box>
      </>
   ) : null
}

export default LinkedContent
