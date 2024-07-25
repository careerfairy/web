import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Avatar, Box, Button, Stack } from "@mui/material"
import Typography from "@mui/material/Typography"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useMemo, useRef } from "react"
import { Briefcase, Edit, Zap } from "react-feather"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import SanitizedHTML from "../../../../util/SanitizedHTML"

const styles = sxStyles({
   wrapper: {
      p: 2,
   },
   header: {
      display: "flex",
   },
   headerLeftSide: {
      display: "flex",
      width: "100%",
      alignItems: "center",
   },
   headerContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
      ml: 3,
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
   userMessage: {
      fontSize: "16px",
      fontWeight: "bold",
   },
   content: {
      mt: 4,
   },
   companyAvatar: {
      width: 63,
      height: 63,
   },
   description: {
      fontSize: "16px",
      fontWeight: 400,
      color: (theme) => theme.palette.text.secondary,
   },
   editButton: {
      textTransform: "none",
      color: "#A0A0A0",
      width: "max-content",
   },
   mobileEditBtnSection: {
      mb: 3,
      display: "flex",
      justifyContent: "center",
   },
   detailsWrapper: {
      display: { xs: "flex", md: "inline" },
      flexDirection: "column",
   },
   details: {
      color: "#8B8B8B",
      fontSize: "12px",
   },
   detailsValue: {
      display: "inline",

      "& svg": {
         verticalAlign: "bottom",
         mr: "6px !important",
      },
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
         xl: "0 0 20%",
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
   previewMode?: boolean
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
   previewMode,
}: Props) => {
   const isMobile = useIsMobile()
   const childRef = useRef(null)
   const {
      title,
      jobType,
      businessFunctionsTagIds,
      description,
      salary,
      deadline,
      livestreams,
      sparks,
      groupId,
   } = job

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
         {isMobile && !previewMode ? (
            <Box sx={styles.mobileEditBtnSection}>
               <Button
                  variant={"outlined"}
                  startIcon={<Edit size="18" color="#A0A0A0" />}
                  color={"grey"}
                  sx={styles.editButton}
                  fullWidth
                  onClick={handleEdit}
               >
                  Edit job posting
               </Button>
            </Box>
         ) : null}

         <Box sx={styles.header}>
            <Box sx={styles.headerLeftSide}>
               <Avatar
                  sx={styles.companyAvatar}
                  alt={`company ${companyName} avatar`}
                  src={getResizedUrl(companyLogoUrl, "xs")}
               />

               <Box sx={styles.headerContent}>
                  <Typography variant={"h4"} sx={styles.jobName}>
                     {title}
                  </Typography>

                  {isMobile ? (
                     <Box sx={[styles.detailsWrapper, styles.detailsValue]}>
                        {jobType ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <Briefcase width={14} />
                              {jobType}
                           </Typography>
                        ) : null}

                        {businessFunctionsTagIds ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <Zap width={14} />
                              {businessFunctionsTagIds.join(", ")}
                           </Typography>
                        ) : null}
                     </Box>
                  ) : (
                     <Box sx={styles.detailsWrapper}>
                        <Typography variant={"subtitle1"} sx={styles.details}>
                           <Stack
                              direction={"row"}
                              spacing={2}
                              sx={styles.detailsValue}
                           >
                              {jobType ? (
                                 <>
                                    <Briefcase width={14} />
                                    {jobType}
                                 </>
                              ) : null}
                              {businessFunctionsTagIds ? (
                                 <>
                                    <Zap width={14} />
                                    {businessFunctionsTagIds.join(", ")}
                                 </>
                              ) : null}
                           </Stack>
                        </Typography>
                     </Box>
                  )}
               </Box>
            </Box>

            {isMobile || previewMode ? null : (
               <Box>
                  <Button
                     variant={"outlined"}
                     startIcon={<Edit size="18" color="#A0A0A0" />}
                     color={"grey"}
                     sx={styles.editButton}
                     fullWidth
                     onClick={handleEdit}
                  >
                     Edit job posting
                  </Button>
               </Box>
            )}
         </Box>

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

               {jobSparks.length > 0 ? (
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
