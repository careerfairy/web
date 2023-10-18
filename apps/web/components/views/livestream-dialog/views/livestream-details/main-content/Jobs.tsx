import { FC, useCallback, useMemo } from "react"
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
import {
   LivestreamCustomJobAssociationPresenter,
   LivestreamJobAssociation,
} from "@careerfairy/shared-lib/livestreams"
import StyledToolTip from "../../../../../../materialUI/GlobalTooltips/StyledToolTip"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import useRecordingAccess from "../../../../upcoming-livestream/HeroSection/useRecordingAccess"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import useIsAtsLivestreamJobAssociation from "../../../../../custom-hook/useIsAtsLivestreamJobAssociation"

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
         <JobsComponent {...props} />
      </Box>
   )
}

export const JobsComponent: FC<Props> = ({ presenter }) => {
   let jobsToPresent: (
      | LivestreamJobAssociation
      | LivestreamCustomJobAssociationPresenter
   )[]

   if (presenter.jobs && presenter.jobs.length > 0) {
      jobsToPresent = presenter.jobs
   } else {
      jobsToPresent = presenter.customJobs
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
   job: LivestreamJobAssociation | LivestreamCustomJobAssociationPresenter
   presenter: LivestreamPresenter
}

const JobItem: FC<JobItemProps> = ({ job, presenter }) => {
   const isMobile = useIsMobile()
   const router = useRouter()
   const { successNotification } = useSnackbarNotifications()
   const { authenticatedUser, userStats } = useAuth()
   const { mode, goToJobDetails } = useLiveStreamDialog()
   const isAtsLivestreamAssociation = useIsAtsLivestreamJobAssociation(job)

   const { userHasBoughtRecording } = useRecordingAccess(
      authenticatedUser.email,
      presenter,
      userStats
   )

   let jobId: string, jobName: string

   if (isAtsLivestreamAssociation) {
      jobId = job.jobId
      jobName = job.name
   } else {
      jobId = job.id
      jobName = job.title
   }

   const isPast = presenter.isPast()
   const hasRegistered = presenter.isUserRegistered(authenticatedUser.email)
   const isPageMode = mode === "page"

   const buttonDisabled = useMemo<boolean>(() => {
      const isUpcoming = !isPast

      if (isUpcoming) {
         // You can't see the job details if the livestream is upcoming
         return true
      }

      if (userHasBoughtRecording) {
         // You can see the job details if you bought the recording
         return false
      }

      if (!hasRegistered) {
         // You can't see the job details if you are not registered
         return true
      }

      return !presenter.canApplyToJobsOutsideOfStream()
   }, [isPast, userHasBoughtRecording, hasRegistered, presenter])

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

   const copy = useMemo<{
      title: string
      description: string
      toastTitle?: string
   }>(() => {
      const hasRegistered = presenter.isUserRegistered(authenticatedUser.email)

      if (isPast) {
         if (!hasRegistered && !userHasBoughtRecording) {
            return {
               title: "Job details not available",
               description:
                  "You cannot see the job details, since you did not attend this live stream",
               toastTitle: "Not available",
            }
         }
         if (!hasRegistered && userHasBoughtRecording) {
            return {
               title: "See more",
               description:
                  "Watch the recording to get access to the job details",
               toastTitle: "Available",
            }
         }
         if (hasRegistered) {
            return {
               title: "See more",
               description:
                  "You can see the job details because you attended the live stream",
               toastTitle: "Available",
            }
         }
      }

      return {
         title: "Details in live stream",
         description: "The job details are presented during the live stream!",
         toastTitle: "Available soon",
      }
   }, [presenter, authenticatedUser.email, isPast, userHasBoughtRecording])

   const onClick = useCallback(() => {
      if (buttonDisabled && isMobile) {
         successNotification(copy.description, copy.toastTitle)
      }

      if (!isPageMode) {
         goToJobDetails(jobId)
      }
   }, [
      buttonDisabled,
      isMobile,
      isPageMode,
      successNotification,
      copy.description,
      copy.toastTitle,
      goToJobDetails,
      jobId,
   ])

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
               <Typography sx={styles.jobName}>{jobName}</Typography>
            </Stack>
         </Stack>
         <Box sx={styles.jobActionWrapper}>
            <StyledToolTip
               placement="top"
               title={buttonDisabled ? copy.description : ""}
            >
               <span onClick={onClick}>
                  <Button
                     component={isPageMode ? Link : undefined}
                     shallow
                     disabled={buttonDisabled}
                     scroll={false}
                     variant="contained"
                     disableElevation
                     color="primary"
                     size="small"
                     sx={styles.seeMoreBtn}
                     // @ts-ignore
                     href={isPageMode ? jobLink : undefined}
                  >
                     {copy.title}
                  </Button>
               </span>
            </StyledToolTip>
         </Box>
      </Stack>
   )
}

export default Jobs
