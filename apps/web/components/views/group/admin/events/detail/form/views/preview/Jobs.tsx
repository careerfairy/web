import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"
import { Briefcase as JobIcon } from "react-feather"
import StaticSkeleton from "./StaticSkeleton"

const styles = sxStyles({
   jobItemRoot: {
      border: "1px solid #F5F5F5",
      borderRadius: 5,
      p: 2.5,
      bgcolor: "background.paper",
   },
   jobName: {
      fontSize: "1.285rem",
      fontWeight: 500,
   },
   jobIconWrapper: {
      borderRadius: "50%",
      p: 1,
      bgcolor: (theme) => `${alpha(theme.palette.primary.main, 0.1)}`,
      display: "inline-block",
      "& svg": {
         color: "primary.main",
      },
   },
   seeMoreBtn: {
      boxShadow: "none",
      textTransform: "none",
      py: 1,
      width: {
         xs: "100%",
         sm: "max-content",
      },
      cursor: "initial",
      "&:hover": {
         bgcolor: "primary.main",
         boxShadow: "none",
      },
   },
   skeleton: {
      transform: "none !important",
      borderRadius: 5,
   },
})

type JobsProps = {
   jobs: (LivestreamJobAssociation | PublicCustomJob)[]
}

const Jobs = ({ jobs }: JobsProps) => {
   return (
      <Box>
         <SectionTitle>Linked Jobs</SectionTitle>
         <Stack spacing={2}>
            {jobs ? (
               jobs.map((job, index) => {
                  const isAtsLivestreamAssociation = "integrationId" in job

                  return (
                     <JobItem
                        key={index}
                        jobName={
                           isAtsLivestreamAssociation ? job.name : job.title
                        }
                     />
                  )
               })
            ) : (
               <JobsSkeleton />
            )}
         </Stack>
      </Box>
   )
}

type JobItemProps = {
   jobName: string
}

const JobItem = ({ jobName }: JobItemProps) => {
   return (
      <Stack
         direction={{
            xs: "column",
            sm: "row",
         }}
         justifyContent="space-between"
         alignItems="center"
         sx={styles.jobItemRoot}
         spacing={2}
      >
         <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={styles.jobIconWrapper}>
               <JobIcon />
            </Box>
            <Stack spacing={1.5}>
               <Typography sx={styles.jobName}>{jobName}</Typography>
            </Stack>
         </Stack>
         <Box>
            <Button
               variant="contained"
               disableRipple
               color="primary"
               size="small"
               sx={styles.seeMoreBtn}
            >
               {"See more"}
            </Button>
         </Box>
      </Stack>
   )
}

const JobsSkeleton = () => {
   return <StaticSkeleton height={85} sx={styles.skeleton} />
}

export default Jobs
