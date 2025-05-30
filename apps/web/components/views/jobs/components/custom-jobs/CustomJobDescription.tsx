import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { SxProps, Theme, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { FC } from "react"
import { combineStyles, sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import SanitizedHTML from "../../../../util/SanitizedHTML"

const styles = sxStyles({
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
   },
})

type Props = {
   job: CustomJob | PublicCustomJob
   jobDeadlineWrapperSx?: SxProps<Theme>
}

const CustomJobDescription: FC<Props> = ({ job, jobDeadlineWrapperSx }) => {
   const jobDeadline = job.deadline
      ? DateUtil.formatDateToString(job.deadline.toDate())
      : ""

   return (
      <Stack spacing={"24px"}>
         <Box sx={styles.wrapper} mt={0}>
            <SanitizedHTML sx={styles.html} htmlString={job.description} />
         </Box>

         {jobDeadline ? (
            <Box
               sx={combineStyles(styles.wrapper, jobDeadlineWrapperSx)}
               gap={2}
            >
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

export default CustomJobDescription
