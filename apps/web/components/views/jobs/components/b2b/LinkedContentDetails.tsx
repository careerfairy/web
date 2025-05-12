import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import EventsPreviewCarousel, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
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
})

type Props = {
   job: CustomJob
}

const LinkedContentDetails = ({ job }: Props) => {
   const { livestreams, sparks, groupId } = job

   const upcomingLiveStreams = useListenToStreams({ filterByGroupId: groupId })
   const { allLivestreams: linkedLiveStreams } =
      useCustomJobLinkedLivestreams(job)
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
                     disableTracking
                  />
               </Box>
            </Box>
         ) : null}

         {jobSparks.length > 0 ? (
            <Box sx={styles.linkedContentWrapper}>
               <SparksCarousel
                  sparks={jobSparks}
                  disableClick
                  header={
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Sparks related to this job
                     </Typography>
                  }
               />
            </Box>
         ) : null}
      </>
   )
}

export default LinkedContentDetails
