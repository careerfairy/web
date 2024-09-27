import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import { SparksCarousel } from "components/views/mentor-page/SparksCarousel"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   subTitle: {
      fontSize: "18px",
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
         sm: `0 0 60%`,
         md: "0 0 60%",
         xl: "0 0 60%",
      },
      maxWidth: { md: 360 },
      minWidth: 0,
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
})

type Props = {
   job: CustomJob
}

const defaultStyling: EventsCarouselStyling = {
   compact: true,
   viewportSx: styles.viewport,
   slide: styles.slide,
}

const LinkedContentDetails = ({ job }: Props) => {
   const { jobHubV1 } = useFeatureFlags()

   const { livestreams, sparks, groupId } = job

   const upcomingLiveStreams = useListenToStreams({ filterByGroupId: groupId })
   const linkedLiveStreams = useCustomJobLinkedLivestreams(job)
   const { data: publishedSparks } = useGroupSparks(groupId, {
      isPublished: true,
   })

   const allLivesStreams = useMemo(
      () => [
         ...new Map(
            [
               ...(linkedLiveStreams ? linkedLiveStreams : []),
               ...(upcomingLiveStreams ? upcomingLiveStreams : []),
            ].map((stream) => [stream.id, stream])
         ).values(),
      ],
      [linkedLiveStreams, upcomingLiveStreams]
   )

   const jobLivestreams = useMemo(
      () => allLivesStreams.filter((event) => livestreams?.includes(event.id)),
      [allLivesStreams, livestreams]
   )
   const jobSparks = useMemo(
      () => publishedSparks.filter((spark) => sparks?.includes(spark.id)),
      [publishedSparks, sparks]
   )

   return (
      <>
         {jobLivestreams.length > 0 ? (
            <Box>
               <Typography variant={"subtitle1"} sx={styles.subTitle}>
                  Live streams related to this job
               </Typography>
               <Box sx={styles.linkedContentWrapper}>
                  <EventsPreviewCarousel
                     id={"job-events"}
                     type={EventsTypes.JOB_EVENTS}
                     events={jobLivestreams}
                     isEmbedded
                     disableClick
                     styling={defaultStyling}
                  />
               </Box>
            </Box>
         ) : null}

         {jobSparks.length > 0 && jobHubV1 ? (
            <Box>
               <Typography variant={"subtitle1"} sx={styles.subTitle}>
                  Sparks related to this job
               </Typography>
               <Box sx={styles.linkedContentWrapper}>
                  <SparksCarousel sparks={jobSparks} disableClick />
               </Box>
            </Box>
         ) : null}
      </>
   )
}

export default LinkedContentDetails
