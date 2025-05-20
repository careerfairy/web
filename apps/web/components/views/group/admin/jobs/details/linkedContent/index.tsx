import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Button, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useCustomJobLinkedSparks from "components/custom-hook/custom-job/useCustomJobLinkedSparks"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useIsMobile from "components/custom-hook/useIsMobile"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import EventsPreviewCarousel, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react"
import { Edit2, PlayCircle, Radio } from "react-feather"
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
   wrapper: {
      p: 2,
      borderRadius: "15px",
      background: "white",
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
   noContentWrapper: {
      display: "flex",
      background: (theme) => theme.brand.white[300],
      borderRadius: "8px",
      py: 4,
      justifyContent: "center",

      "& svg": {
         color: "secondary.main",
      },
   },
   noContentInfo: {
      alignItems: "center",
      textAlign: "center",
   },
   noContentTitle: {
      fontSize: "20px",
      fontWeight: 600,
   },
   noContentSubtitle: {
      fontSize: "16px",
      fontWeight: 400,
   },
})

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

   const jobHasNoContent = useMemo(
      () => Boolean(job.livestreams.length == 0 && job.sparks.length == 0),
      [job.livestreams.length, job.sparks.length]
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
                        hasUpcomingLiveStreams={groupHasUpcomingLivestreams}
                     />
                  </SuspenseWithBoundary>

                  <SuspenseWithBoundary fallback={<></>}>
                     <SparksContent
                        job={job}
                        setEditDialogState={setEditDialogState}
                        hasSparksToLink={group.publicSparks}
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
            initialPage={"details"}
            serverUserEmail={group.adminEmail}
            mode="stand-alone"
            providedOriginSource={`group-admin-job-${job.id}`}
         />
      </>
   )
}

type ContentProps = {
   job: CustomJob
   setEditDialogState: Dispatch<SetStateAction<EditDialogState>>
   setLiveStreamDialog?: Dispatch<SetStateAction<LiveStreamDialogState>>
   hasUpcomingLiveStreams?: boolean
   hasSparksToLink?: boolean
}
const LiveStreamsContent = ({
   job,
   setEditDialogState,
   setLiveStreamDialog,
   hasUpcomingLiveStreams,
}: ContentProps) => {
   const { allLivestreams: linkedLivestreams } =
      useCustomJobLinkedLivestreams(job)
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

   const hasLiveStreamsToLink = useMemo(
      () => hasUpcomingLiveStreams || linkedLivestreams.length > 0,
      [hasUpcomingLiveStreams, linkedLivestreams.length]
   )

   return hasLiveStreamsToLink ? (
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
            {linkedLivestreams.length > 0 ? (
               <EventsPreviewCarousel
                  id={"job-events"}
                  type={EventsTypes.JOB_EVENTS}
                  events={linkedLivestreams}
                  isEmbedded
                  onCardClick={handleCardClick}
                  styling={{ padding: false }}
                  disableTracking
               />
            ) : (
               <MissingContent
                  title="Link live streams to your job!"
                  subtitle="Use live streams to give talent real-time insights into your company."
                  handleClick={handleEditLiveStreams}
                  icon={<Radio size={40} />}
                  ctaText="Link live streams"
               />
            )}
         </Box>
      </>
   ) : null
}

const SparksContent = ({
   job,
   setEditDialogState,
   hasSparksToLink,
}: ContentProps) => {
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

   return hasSparksToLink ? (
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
            {linkedSparks.length > 0 ? (
               <SparksCarousel
                  sparks={linkedSparks}
                  options={sparksCarouselEmblaOptions}
                  onSparkClick={handleSparkClick}
               />
            ) : (
               <MissingContent
                  title="Link Sparks to your job!"
                  subtitle="Use your Sparks to enrich this job listing and engage with talent."
                  ctaText="Link Sparks"
                  icon={<PlayCircle size={40} />}
                  handleClick={handleEditSparks}
               />
            )}
         </Box>
      </>
   ) : null
}

type MissingContentProps = {
   icon: JSX.Element
   title: string
   subtitle: string
   ctaText: string
   handleClick: () => void
}

const MissingContent = ({
   title,
   subtitle,
   ctaText,
   icon,
   handleClick,
}: MissingContentProps) => {
   return (
      <Box sx={styles.noContentWrapper}>
         <Stack spacing={3} sx={styles.noContentInfo}>
            {icon}

            <Box>
               <Typography sx={styles.noContentTitle}>{title}</Typography>
               <Typography sx={styles.noContentSubtitle}>{subtitle}</Typography>
            </Box>

            <Button variant="contained" color="secondary" onClick={handleClick}>
               {ctaText}
            </Button>
         </Stack>
      </Box>
   )
}

export default LinkedContent
