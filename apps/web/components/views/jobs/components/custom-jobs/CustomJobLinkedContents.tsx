import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box, Stack, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import EventsPreviewCarousel, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   subTitle: {
      fontSize: "18px",
      fontWeight: 600,
   },
   linkedContentWrapper: {
      my: 2,
   },
})

const sparksCarouselEmblaOptions: EmblaOptionsType = {
   align: "start",
}

type CustomJobLinkedContentsProps = {
   job: CustomJob
   disableEventClick?: boolean
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
}

const CustomJobLinkedContents = ({
   job,
   disableEventClick,
   hideLinkedLivestreams,
   hideLinkedSparks,
}: CustomJobLinkedContentsProps) => {
   const { sparks, groupId } = job
   const { publishedLivestreams: jobLivestreams } =
      useCustomJobLinkedLivestreams(job)

   const { data: publishedSparks } = useGroupSparks(groupId, {
      isPublished: true,
   })

   const jobSparks = useMemo(
      () => publishedSparks.filter((spark) => sparks.includes(spark.id)),
      [publishedSparks, sparks]
   )

   return (
      <Stack>
         {hideLinkedLivestreams ? null : (
            <CustomJobLinkedLivestreams
               livestreams={jobLivestreams}
               disableEventClick={disableEventClick}
            />
         )}
         {!hideLinkedSparks ? (
            <CustomJobLinkedSparks
               disableSparkClick={disableEventClick}
               sparks={jobSparks}
            />
         ) : null}
      </Stack>
   )
}

type CustomJobLinkedLivestreamsProps = {
   livestreams: LivestreamEvent[]
   disableEventClick?: boolean
}
const CustomJobLinkedLivestreams = ({
   livestreams,
   disableEventClick: disableClick,
}: CustomJobLinkedLivestreamsProps) => {
   if (!livestreams.length) return null
   return (
      <Box>
         <Typography variant={"subtitle1"} sx={styles.subTitle}>
            Live streams related to this job
         </Typography>
         <Box sx={styles.linkedContentWrapper}>
            <EventsPreviewCarousel
               id={"job-events"}
               type={EventsTypes.JOB_EVENTS}
               events={livestreams}
               isEmbedded
               disableClick={disableClick}
               styling={{ padding: false }}
            />
         </Box>
      </Box>
   )
}

type CustomJobLinkedSparksProps = {
   sparks: Spark[]
   disableSparkClick?: boolean
}

const CustomJobLinkedSparks = ({
   sparks,
   disableSparkClick,
}: CustomJobLinkedSparksProps) => {
   const router = useRouter()

   const handleSparksClicked = (spark: Spark) => {
      if (!spark || disableSparkClick) return

      return router.push({
         pathname: `/sparks/${spark.id}`,
         query: {
            // Not spreading params
            interactionSource: SparkInteractionSources.CustomJob,
         },
      })
   }

   if (!sparks.length) return null
   return (
      <Box>
         <Typography variant={"subtitle1"} sx={styles.subTitle}>
            Sparks related to this job
         </Typography>
         <Box sx={styles.linkedContentWrapper}>
            <SparksCarousel
               sparks={sparks}
               options={sparksCarouselEmblaOptions}
               onSparkClick={handleSparksClicked}
            />
         </Box>
      </Box>
   )
}

export default CustomJobLinkedContents
