import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Button, Stack, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useCustomJobLinkedSparks from "components/custom-hook/custom-job/useCustomJobLinkedSparks"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useRef, useState } from "react"
import { Edit2 } from "react-feather"
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

export type DialogState = {
   open: boolean
   step?: number
}

const LinkedContent = ({ job }: Props) => {
   const childRef = useRef(null)
   const { group } = useGroup()
   const [dialogState, setDialogState] = useState<DialogState>({ open: false })
   const linkedLivestreams = useCustomJobLinkedLivestreams(job)
   const linkedSparks = useCustomJobLinkedSparks(job)
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(
      group.groupId
   )
   const { jobHubV1 } = useFeatureFlags()
   const isMobile = useIsMobile()

   const jobHasNoContent = jobHubV1
      ? Boolean(job.livestreams.length == 0 && job.sparks.length == 0)
      : false

   const linkJobToContentClick = useCallback(() => {
      setDialogState({
         open: true,
         step: groupHasUpcomingLivestreams ? 0 : 1,
      })
   }, [groupHasUpcomingLivestreams])

   const handleEditLiveStreams = () => {
      setDialogState({ open: true, step: 0 })
   }

   const handleEditSparks = () => {
      setDialogState({ open: true, step: 1 })
   }

   return (
      <>
         {jobHasNoContent ? (
            <PendingContent handleClick={linkJobToContentClick} />
         ) : (
            <Box sx={styles.wrapper}>
               <Stack spacing={2}>
                  {linkedLivestreams.length > 0 ? (
                     <>
                        <Box sx={styles.header}>
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.subTitle}
                           >
                              Live streams related to this job
                           </Typography>

                           {isMobile ? (
                              <Edit2
                                 color="grey"
                                 size={18}
                                 onClick={handleEditLiveStreams}
                              />
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
                              disableClick
                              styling={defaultStyling}
                           />
                        </Box>
                     </>
                  ) : null}

                  {linkedSparks.length > 0 ? (
                     <>
                        <Box sx={styles.header}>
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.subTitle}
                           >
                              Sparks related to this job
                           </Typography>

                           {isMobile ? (
                              <Edit2
                                 color="grey"
                                 size={18}
                                 onClick={handleEditSparks}
                              />
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
                           />
                        </Box>
                     </>
                  ) : null}
               </Stack>
            </Box>
         )}

         <LinkedContentFormProvider job={job}>
            <LinkedContentDialog
               job={job}
               dialogState={dialogState}
               handleClose={() => setDialogState({ open: false })}
            />
         </LinkedContentFormProvider>
      </>
   )
}

export default LinkedContent
