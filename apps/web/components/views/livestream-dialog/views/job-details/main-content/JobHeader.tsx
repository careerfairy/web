import { Job } from "@careerfairy/shared-lib/ats/Job"
import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { FC } from "react"
import { Briefcase, Edit, Zap } from "react-feather"
import { sxStyles } from "../../../../../../types/commonTypes"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   header: {
      display: "flex",
      backgroundColor: (theme) => theme.brand.white[400],
      borderRadius: "8px",
      padding: "12px",
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
   content: {
      mt: 4,
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
   skeletonDetailsValue: {
      display: "flex",
      alignItems: "center",
   },
   logoSkeleton: {
      borderRadius: 4,
   },
})

type Props = {
   job: Job | PublicCustomJob
   companyName: string
   companyLogoUrl: string
   editMode?: boolean
   handleClick?: () => void
}

const JobHeader = ({
   job,
   companyName,
   companyLogoUrl,
   editMode,
   handleClick,
}: Props) => {
   const isAtsJob = useIsAtsJob(job)
   const isMobile = useIsMobile()

   let jobName: string, jobType: string, jobBusinessFunctionsTagIds: string[]

   if (isAtsJob) {
      jobName = job.name
      jobType = job.getDepartment()
   } else {
      jobName = job.title
      jobType = job.jobType
      jobBusinessFunctionsTagIds = (job.businessFunctionsTagIds || []).map(
         (tagId) => TagValuesLookup[tagId]
      )
   }

   return (
      <>
         {isMobile && editMode ? (
            <Box sx={styles.mobileEditBtnSection}>
               <Button
                  variant={"outlined"}
                  startIcon={<Edit size="18" color="#A0A0A0" />}
                  color={"grey"}
                  sx={styles.editButton}
                  fullWidth
                  onClick={handleClick}
               >
                  Edit job posting
               </Button>
            </Box>
         ) : null}

         <Box sx={styles.header}>
            <Box sx={styles.headerLeftSide}>
               <CircularLogo
                  src={getResizedUrl(companyLogoUrl, "lg")}
                  alt={`company ${companyName} logo`}
                  size={63}
               />

               <Box sx={styles.headerContent}>
                  <Typography variant={"h4"} sx={styles.jobName}>
                     {jobName}
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

                        {jobBusinessFunctionsTagIds?.length > 0 ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <Zap width={14} />
                              {jobBusinessFunctionsTagIds.join(", ")}
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
                              {jobBusinessFunctionsTagIds?.length > 0 ? (
                                 <>
                                    <Zap width={14} />
                                    {jobBusinessFunctionsTagIds.join(", ")}
                                 </>
                              ) : null}
                           </Stack>
                        </Typography>
                     </Box>
                  )}
               </Box>
            </Box>

            {isMobile || !editMode ? null : (
               <Box>
                  <Button
                     variant={"outlined"}
                     startIcon={<Edit size="18" color="#A0A0A0" />}
                     color={"grey"}
                     sx={styles.editButton}
                     fullWidth
                     onClick={handleClick}
                  >
                     Edit job posting
                  </Button>
               </Box>
            )}
         </Box>
      </>
   )
}

export const JobHeaderSkeleton: FC = () => {
   return (
      <Box sx={styles.header}>
         <Box sx={styles.headerLeftSide}>
            <Skeleton
               sx={styles.logoSkeleton}
               variant={"rectangular"}
               width={63}
               height={63}
            />
            <Box sx={styles.headerContent}>
               <Typography variant={"h4"} sx={styles.jobName}>
                  <Skeleton width={200} />
               </Typography>

               <Box sx={styles.detailsWrapper}>
                  <Typography variant={"subtitle1"} sx={styles.details}>
                     <Stack
                        direction={"row"}
                        spacing={2}
                        sx={styles.skeletonDetailsValue}
                     >
                        <Skeleton
                           sx={styles.logoSkeleton}
                           variant={"rectangular"}
                           width={14}
                           height={14}
                        />
                        <Skeleton width={100} />
                        <Skeleton
                           sx={styles.logoSkeleton}
                           variant={"rectangular"}
                           width={14}
                           height={14}
                        />
                        <Skeleton width={100} />
                     </Stack>
                  </Typography>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default JobHeader
