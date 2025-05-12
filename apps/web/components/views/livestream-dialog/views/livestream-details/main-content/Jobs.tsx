import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import JobCard from "components/views/common/jobs/JobCard"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import { LinkProps } from "next/dist/client/link"
import { useRouter } from "next/router"
import { FC, useMemo } from "react"
import { Briefcase as JobIcon } from "react-feather"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupCustomJobs from "../../../../../custom-hook/custom-job/useGroupCustomJobs"
import useIsAtsLivestreamJobAssociation from "../../../../../custom-hook/useIsAtsLivestreamJobAssociation"
import Link from "../../../../common/Link"
import Loader from "../../../../loader/Loader"
import { buildDialogLink } from "../../../util"
import SectionTitle from "./SectionTitle"

const styles = sxStyles({
   jobItemRoot: {
      border: "1px solid #F5F5F5",
      borderRadius: 5,
      p: 2.5,
      bgcolor: "background.paper",
   },
   jobDetails: {},
   jobActionWrapper: {},
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
   },
   buttonSkeleton: {
      borderRadius: 4,
      height: 40,
      width: {
         xs: "100%",
         sm: 120,
      },
   },
})

interface Props {
   presenter: LivestreamPresenter
}

const Jobs: FC<Props> = (props) => {
   return (
      <Box>
         <SectionTitle>Jobs in focus</SectionTitle>
         <SuspenseWithBoundary fallback={<Loader />}>
            <JobsComponent {...props} />
         </SuspenseWithBoundary>
      </Box>
   )
}

const JobsComponent: FC<Props> = ({ presenter }) => {
   const { data: livestreamHost } = useLivestreamCompanyHostSWR(presenter.id)
   const livestreamCustomJobs = useGroupCustomJobs(livestreamHost.id, {
      livestreamId: presenter.id,
   })?.filter((job) => job.published)

   let jobsToPresent: (LivestreamJobAssociation | CustomJob)[]

   if (presenter.jobs && presenter.jobs.length > 0) {
      jobsToPresent = presenter.jobs
   } else {
      jobsToPresent = livestreamCustomJobs
   }

   return (
      <Stack spacing={2}>
         {jobsToPresent.map((job, index) => (
            <JobItem presenter={presenter} key={index} job={job} />
         ))}
      </Stack>
   )
}

type JobItemProps = {
   job: LivestreamJobAssociation | CustomJob
   presenter: LivestreamPresenter
}

const JobItem: FC<JobItemProps> = ({ job, presenter }) => {
   const router = useRouter()
   const { mode, goToJobDetails } = useLiveStreamDialog()
   const isAtsLivestreamAssociation = useIsAtsLivestreamJobAssociation(job)

   let jobId: string, jobName: string

   if (isAtsLivestreamAssociation) {
      jobId = job.jobId
      jobName = job.name
   } else {
      jobId = job.id
      jobName = job.title
   }

   const isPageMode = mode === "page"

   const jobLink = useMemo<LinkProps["href"]>(
      () =>
         buildDialogLink({
            router,
            link: {
               type: "jobDetails",
               jobId: jobId,
               livestreamId: presenter.id,
            },
         }),
      [router, jobId, presenter.id]
   )

   const onClick = () => {
      if (!isPageMode) {
         goToJobDetails(jobId)
      }
   }

   return isAtsLivestreamAssociation ? (
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
            <Stack sx={styles.jobDetails} spacing={1.5}>
               <Typography sx={styles.jobName}>{jobName}</Typography>
            </Stack>
         </Stack>
         <Box sx={styles.jobActionWrapper}>
            <span onClick={onClick}>
               <Button
                  component={isPageMode ? Link : undefined}
                  shallow
                  scroll={false}
                  variant="contained"
                  disableElevation
                  color="primary"
                  size="small"
                  sx={styles.seeMoreBtn}
                  // @ts-ignore
                  href={isPageMode ? jobLink : undefined}
               >
                  {"See more"}
               </Button>
            </span>
         </Box>
      </Stack>
   ) : (
      <JobCard
         job={job as CustomJob}
         previewMode
         handleClick={() => goToJobDetails((job as CustomJob).id)}
         hideJobUrl
      />
   )
}

export default Jobs
