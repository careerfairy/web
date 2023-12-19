import { FC } from "react"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Image from "next/legacy/image"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { alpha } from "@mui/material/styles"
import { MapPin as LocationIcon } from "react-feather"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"

const styles = sxStyles({
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 4,
      display: "flex",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
   },
   logoSkeleton: {
      borderRadius: 4,
   },
   jobTitle: {
      fontSize: "2.285rem",
      fontWeight: 600,
   },
   jobDepartment: {
      fontSize: "1.143rem",
      fontWeight: 400,
   },
   jobLocation: {
      fontSize: "1rem",
      fontWeight: 300,
      display: "flex",
      alignItems: "center",
      "& svg": {
         mr: 0.7,
         width: "1em",
         height: "1em",
      },
   },
   lightText: {
      color: (theme) => `${alpha(theme.palette.text.secondary, 0.4)}`,
   },
})

type Props = {
   job: Job | PublicCustomJob
   livestreamPresenter: LivestreamPresenter
}

const JobHeader: FC<Props> = ({ job, livestreamPresenter }) => {
   const isAtsJob = useIsAtsJob(job)

   let jobName: string, jobLocation: string, jobDepartment: string

   if (isAtsJob) {
      jobName = job.name
      jobLocation = job.getLocation()
      jobDepartment = job.getDepartment()
   } else {
      jobName = job.title
      jobDepartment = job.jobType
   }

   return (
      <Stack spacing={1.5} direction="row">
         <Box sx={styles.logoWrapper}>
            <Image
               src={getResizedUrl(livestreamPresenter.companyLogoUrl, "lg")}
               width={50}
               height={50}
               objectFit={"contain"}
               alt={livestreamPresenter.company}
            />
         </Box>
         <Box sx={styles.companyNameWrapper}>
            <Typography sx={styles.jobTitle} component={"h4"}>
               {jobName}
            </Typography>
            {jobDepartment ? (
               <Typography sx={[styles.jobDepartment, styles.lightText]}>
                  {jobDepartment}
               </Typography>
            ) : null}
            {jobLocation ? (
               <Typography sx={[styles.jobLocation, styles.lightText]}>
                  <LocationIcon />
                  {jobLocation}
               </Typography>
            ) : null}
         </Box>
      </Stack>
   )
}

export const JobHeaderSkeleton: FC = () => {
   return (
      <Stack spacing={1.5} direction="row">
         <Skeleton
            sx={styles.logoSkeleton}
            variant={"rectangular"}
            width={58}
            height={58}
         />
         <Box sx={styles.companyNameWrapper}>
            <Typography sx={styles.jobTitle} component={"h4"}>
               <Skeleton width={200} />
            </Typography>
            <Typography sx={[styles.jobDepartment, styles.lightText]}>
               <Skeleton width={100} />
            </Typography>
            <Typography sx={[styles.jobLocation, styles.lightText]}>
               <LocationIcon />
               <Skeleton width={100} />
            </Typography>
         </Box>
      </Stack>
   )
}

export default JobHeader
