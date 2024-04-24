import { Job } from "@careerfairy/shared-lib/ats/Job"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { FC } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import DateUtil from "../../../../../../util/DateUtil"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"
import SanitizedHTML from "../../../../../util/SanitizedHTML"

const styles = sxStyles({
   root: {},
   jobTitle: {
      fontWeight: 600,
   },
   html: {
      fontSize: "1.1rem",
      lineHeight: "1.7rem",
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
      fontWeight: 600,
   },
   jobValues: {
      fontSize: "1.1rem",
   },
   wrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
   },
   confirmationWrapper: {
      display: "flex",
      padding: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      position: "absolute",
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
   const isAtsJob = useIsAtsJob(job)

   let jobSalary: string, jobDeadline: string

   if (!isAtsJob) {
      jobSalary = job.salary
      jobDeadline = job.deadline
         ? DateUtil.formatDateToString(job.deadline.toDate())
         : ""
   }

   return (
      <Stack spacing={"24px"}>
         <Box sx={styles.wrapper}>
            <Typography sx={styles.jobTitle} variant="h6">
               Job Description
            </Typography>
            <SanitizedHTML sx={styles.html} htmlString={job.description} />
         </Box>

         {jobSalary ? (
            <Box sx={styles.wrapper}>
               <Typography variant={"h6"} sx={styles.subTitle}>
                  Salary
               </Typography>
               <Typography variant={"body1"} sx={styles.jobValues}>
                  {jobSalary}
               </Typography>
            </Box>
         ) : null}

         {jobDeadline ? (
            <Box sx={styles.wrapper}>
               <Typography variant={"h6"} sx={styles.subTitle}>
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
