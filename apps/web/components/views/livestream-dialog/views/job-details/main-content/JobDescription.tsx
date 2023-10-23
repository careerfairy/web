import React, { FC } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import { Typography } from "@mui/material"
import SanitizedHTML from "../../../../../util/SanitizedHTML"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import Skeleton from "@mui/material/Skeleton"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import CollapsableText from "../../../../common/inputs/CollapsableText"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"
import Box from "@mui/material/Box"
import DateUtil from "../../../../../../util/DateUtil"

const styles = sxStyles({
   root: {},
   jobTitle: {
      fontSize: "1.428rem",
      fontWeight: 500,
   },
   html: {
      fontSize: "1.1428rem",
      width: "100%",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word",
      hyphens: "auto",
      maxWidth: "100%",
      "& img": {
         maxWidth: "-webkit-fill-available",
      },
   },
   subTitle: {
      fontSize: "20px",
      fontWeight: "bold",
   },
   jobValues: {
      fontSize: "16px",
   },
   confirmationWrapper: {
      display: "flex",
      padding: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      position: "absolute",
      // bottom: "-3px",
      borderRadius: "12px",
      border: "1.5px solid var(--turquoise-turquoise-400, #6ACFC0)",
      background: "var(--white-white-200, #FCFCFE)",
      boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.05)",
   },
})

type Props = {
   job: Job | PublicCustomJob
}

const JobDescription: FC<Props> = ({ job }) => {
   const isMobile = useIsMobile()
   const isAtsJob = useIsAtsJob(job)

   let jobSalary: string, jobDeadline: string

   if (!isAtsJob) {
      jobSalary = job.salary
      jobDeadline = job.deadline
         ? DateUtil.formatDateToString(job.deadline.toDate())
         : ""
   }

   return (
      <Stack spacing={2}>
         <Box>
            <Typography component="h4" sx={styles.jobTitle}>
               Job Description
            </Typography>
            {isAtsJob ? (
               <SanitizedHTML sx={styles.html} htmlString={job.description} />
            ) : (
               <CollapsableText
                  text={job.description}
                  collapsedSize={isMobile ? 190 : 180}
                  textStyle={styles.html}
               />
            )}
         </Box>

         {Boolean(jobSalary) ? (
            <Box>
               <Typography variant={"subtitle1"} sx={styles.subTitle}>
                  Salary
               </Typography>
               <Typography variant={"body1"} sx={styles.jobValues}>
                  {jobSalary}
               </Typography>
            </Box>
         ) : null}

         {Boolean(jobDeadline) ? (
            <Box>
               <Typography variant={"subtitle1"} sx={styles.subTitle}>
                  Application deadline
               </Typography>
               <Typography variant={"body1"} sx={styles.jobValues}>
                  {jobDeadline}
               </Typography>
            </Box>
         ) : null}
      </Stack>
   )
}

export const JobDescriptionSkeleton: FC = () => {
   return (
      <Stack>
         <Typography component="h4" sx={styles.jobTitle}>
            <Skeleton width={200} />
         </Typography>
         <Typography sx={styles.html}>
            {[...Array(3)].map((_, i) => (
               <Skeleton key={i} />
            ))}
            <Skeleton width="50%" />
            <br />
            {[...Array(8)].map((_, i) => (
               <Skeleton key={i} />
            ))}
            <Skeleton width="40%" />
            <br />
            {[...Array(6)].map((_, i) => (
               <Skeleton key={i} />
            ))}
            <Skeleton width="60%" />
         </Typography>
      </Stack>
   )
}

export default JobDescription
