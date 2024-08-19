import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack } from "@mui/material"
import Typography from "@mui/material/Typography"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import JobHeader from "components/views/livestream-dialog/views/job-details/main-content/JobHeader"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useMemo, useRef } from "react"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import SanitizedHTML from "../../../../util/SanitizedHTML"

const styles = sxStyles({
   wrapper: {
      p: 2,
   },
   jobName: {
      fontWeight: 600,
   },
   subTitle: {
      fontSize: "18px",
      fontWeight: 600,
   },
   jobValues: {
      fontSize: "16px",
   },
   content: {
      mt: 4,
   },
   description: {
      fontSize: "16px",
      fontWeight: 400,
      color: (theme) => theme.palette.text.secondary,
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

type Props = {
   job: CustomJob
   handleEdit?: () => void
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
}: Props) => {
   const childRef = useRef(null)
   const { jobHubV1 } = useFeatureFlags()
   const { description, salary, deadline, livestreams, sparks, groupId } = job

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
   const jobDeadline = deadline
      ? DateUtil.formatDateToString(deadline.toDate())
      : ""

   const jobLivestreams = useMemo(
      () => allLivesStreams.filter((event) => livestreams.includes(event.id)),
      [allLivesStreams, livestreams]
   )
   const jobSparks = useMemo(
      () => publishedSparks.filter((spark) => sparks.includes(spark.id)),
      [publishedSparks, sparks]
   )

   return (
      <Box sx={styles.wrapper}>
         <JobHeader
            job={job}
            companyName={companyName}
            companyLogoUrl={companyLogoUrl}
            editMode={!!handleEdit}
            handleClick={handleEdit}
         />

         <Box sx={styles.content}>
            <Stack spacing={2}>
               <Box>
                  <Typography variant={"subtitle1"} sx={styles.subTitle}>
                     Job description
                  </Typography>
                  <SanitizedHTML
                     sx={styles.description}
                     htmlString={description}
                  />
               </Box>

               {salary ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Salary
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {salary}
                     </Typography>
                  </Box>
               ) : null}

               {jobDeadline ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Application deadline
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {jobDeadline}
                     </Typography>
                  </Box>
               ) : null}

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
                        <SparksCarousel
                           ref={childRef}
                           sparks={jobSparks}
                           options={sparksCarouselEmblaOptions}
                        />
                     </Box>
                  </Box>
               ) : null}
            </Stack>
         </Box>
      </Box>
   )
}

export default CustomJobAdminDetails
