import { FC } from "react"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Briefcase, MapPin as LocationIcon } from "react-feather"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsAtsJob from "../../../../../custom-hook/useIsAtsJob"
import CircularLogo from "components/views/common/logos/CircularLogo"

const styles = sxStyles({
   logoWrapper: {
      background: "white",
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
      fontWeight: 600,
   },
   jobDepartment: {
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
      color: "neutral.500",
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
      <Stack spacing={"18px"} direction="row">
         <Box sx={styles.logoWrapper}>
            <CircularLogo
               src={getResizedUrl(livestreamPresenter.companyLogoUrl, "lg")}
               alt={livestreamPresenter.company}
               size={63}
            />
         </Box>
         <Box sx={styles.companyNameWrapper}>
            <Typography sx={styles.jobTitle} variant="h4">
               {jobName}
            </Typography>
            {jobDepartment ? (
               <Box
                  sx={styles.lightText}
                  display="flex"
                  alignItems="center"
                  gap="6px"
               >
                  <Briefcase size={12} />
                  <Typography sx={styles.jobDepartment}>
                     {jobDepartment}
                  </Typography>
               </Box>
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
