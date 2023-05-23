import { FC, useMemo } from "react"
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
      width: {
         xs: "100%",
         sm: 120,
      },
      py: 1,
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
         <JobsComponent {...props} />
      </Box>
   )
}

export const JobsComponent: FC<Props> = ({ presenter }) => {
   return (
      <Stack spacing={2}>
         {presenter.jobs.map((job) => (
            <JobItem presenter={presenter} key={job.jobId} job={job} />
         ))}
      </Stack>
   )
}

type JobItemProps = {
   job: LivestreamJobAssociation
   presenter: LivestreamPresenter
}

const JobItem: FC<JobItemProps> = ({ job, presenter }) => {
   const router = useRouter()

   const jobLink = useMemo<LinkProps["href"]>(
      () =>
         buildDialogLink({
            router,
            link: {
               type: "jobDetails",
               jobId: job.jobId,
               livestreamId: presenter.id,
            },
         }),
      [router, presenter.id, job.jobId]
   )

   return (
      <Stack
         direction={{
            xs: "column",
            sm: "row",
         }}
         justifyContent="space-between"
         sx={styles.jobItemRoot}
         spacing={2}
      >
         <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={styles.jobIconWrapper}>
               <JobIcon />
            </Box>
            <Stack sx={styles.jobDetails} spacing={1.5}>
               <Typography sx={styles.jobName}>{job.name}</Typography>
            </Stack>
         </Stack>
         <Box sx={styles.jobActionWrapper}>
            <span>
               <Button
                  component={Link}
                  shallow
                  scroll={false}
                  variant="contained"
                  disableElevation
                  color="primary"
                  size="small"
                  sx={styles.seeMoreBtn}
                  // @ts-ignore
                  href={jobLink}
               >
                  See more
               </Button>
            </span>
         </Box>
      </Stack>
   )
}

export default Jobs
