import React, { FC } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import { Typography } from "@mui/material"
import SanitizedHTML from "../../../../../util/SanitizedHTML"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import Skeleton from "@mui/material/Skeleton"

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
})

type Props = {
   job: Job
}

const JobDescription: FC<Props> = ({ job }) => {
   return (
      <Stack>
         <Typography component="h4" sx={styles.jobTitle}>
            Job Description
         </Typography>
         <SanitizedHTML sx={styles.html} htmlString={job.description} />
      </Stack>
   )
}

export const JobDescriptionSkeleton: FC = (props) => {
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
