import React, { FC, useMemo } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../../types/commonTypes"
import { Typography } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { Briefcase as JobIcon } from "react-feather"
import Button from "@mui/material/Button"
import Link from "../../../../common/Link"
import { useRouter } from "next/router"
import { LinkProps } from "next/dist/client/link"
import { buildDialogLink } from "../../../util"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import useIsAtsLivestreamJobAssociation from "../../../../../custom-hook/useIsAtsLivestreamJobAssociation"
import useGroupCustomJobs from "../../../../../custom-hook/custom-job/useGroupCustomJobs"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import Loader from "../../../../loader/Loader"

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
         <SectionTitle>Linked Jobs</SectionTitle>
         <SuspenseWithBoundary fallback={<Loader />}>
            <JobsComponent {...props} />
         </SuspenseWithBoundary>
      </Box>
   )
}

const JobsComponent: FC<Props> = ({ presenter }) => {
   const livestreamCustomJobs = useGroupCustomJobs(presenter.groupIds[0], {
      livestreamId: presenter.id,
   })

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
   )
}

export default Jobs
