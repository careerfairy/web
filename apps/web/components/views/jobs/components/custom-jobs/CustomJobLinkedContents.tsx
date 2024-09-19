import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Box, Stack, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useMemo, useRef } from "react"
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

const defaultStyling: EventsCarouselStyling = {
   compact: true,
   viewportSx: styles.viewport,
   slide: styles.slide,
}

const sparksCarouselEmblaOptions: EmblaOptionsType = {
   align: "start",
}

type CustomJobLinkedContentsProps = {
   job: CustomJob
   disableEventClick?: boolean
}

const CustomJobLinkedContents = ({
   job,
   disableEventClick,
}: CustomJobLinkedContentsProps) => {
   const { jobHubV1 } = useFeatureFlags()
   const { sparks, groupId } = job
   const jobLivestreams = useCustomJobLinkedLivestreams(job)

   const { data: publishedSparks } = useGroupSparks(groupId, {
      isPublished: true,
   })

   const jobSparks = useMemo(
      () => publishedSparks.filter((spark) => sparks.includes(spark.id)),
      [publishedSparks, sparks]
   )

   return (
      <Stack>
         <CustomJobLinkedLivestreams
            livestreams={jobLivestreams}
            disableEventClick={disableEventClick}
         />
         {jobHubV1 ? <CustomJobLinkedSparks sparks={jobSparks} /> : null}
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
               styling={defaultStyling}
            />
         </Box>
      </Box>
   )
}

type CustomJobLinkedSparksProps = {
   sparks: Spark[]
}

const CustomJobLinkedSparks = ({ sparks }: CustomJobLinkedSparksProps) => {
   const childRef = useRef(null)

   if (!sparks.length) return null
   return (
      <Box>
         <Typography variant={"subtitle1"} sx={styles.subTitle}>
            Sparks related to this job
         </Typography>
         <Box sx={styles.linkedContentWrapper}>
            <SparksCarousel
               ref={childRef}
               sparks={sparks}
               options={sparksCarouselEmblaOptions}
            />
         </Box>
      </Box>
   )
}

export default CustomJobLinkedContents
