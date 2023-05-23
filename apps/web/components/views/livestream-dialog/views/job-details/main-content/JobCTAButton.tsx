import { FC, useState } from "react"
import Box from "@mui/material/Box"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import Button from "@mui/material/Button"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../../types/commonTypes"
import LoadingButton from "@mui/lab/LoadingButton"
import UploadIcon from "@mui/icons-material/CloudUploadOutlined"
import { useRouter } from "next/router"
import Link from "../../../../common/Link"
import { ButtonProps } from "@mui/material"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import useJobApply from "../../../../../custom-hook/ats/useJobApply"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import CheckIcon from "@mui/icons-material/Check"
import { useLiveStreamDialog } from "../../../LivestreamDialog"
import useUploadCV from "../../../../../custom-hook/user/useUploadCV"
import { alpha } from "@mui/material/styles"
import FileUploader from "../../../../common/FileUploader"

const styles = sxStyles({
   root: {},
   btn: {
      boxShadow: "none",
      py: 0.75,
      px: 2.5,
      fontSize: "1.214rem",
      fontWeight: 400,
      textTransform: "none",
   },
   goBackBtn: {
      ml: "auto",
   },
   loadingBtn: {
      color: "transparent !important",
   },
   dragActive: {
      backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
      border: "none",
   },
})

type Props = {
   job: Job
   livestreamPresenter: LivestreamPresenter
}

const JobCTAButton: FC<Props> = ({ job, livestreamPresenter }) => {
   const { userPresenter, isLoggedOut, authenticatedUser } = useAuth()

   if (job.isClosed()) {
      return <ClosedJobButton />
   }

   if (!authenticatedUser.isLoaded) {
      return <ButtonSkeleton />
   }

   if (isLoggedOut) return <SignUpButton />

   if (userPresenter.hasResume()) {
      return (
         <SuspenseWithBoundary>
            <ApplyButton job={job} livestreamId={livestreamPresenter.id} />
         </SuspenseWithBoundary>
      )
   }

   return <UploadCVButton />
}

const SignUpButton: FC = () => {
   const { asPath } = useRouter()

   return (
      // @ts-ignore
      <Button
         href={`/signup?absolutePath=${asPath}`}
         color="primary"
         sx={styles.btn}
         {...baseButtonProps}
         component={Link}
      >
         Sign Up
      </Button>
   )
}

const UploadCVButton: FC = () => {
   const { fileUploaderProps, dragActive, isLoading } = useUploadCV()

   return (
      <FileUploader
         {...fileUploaderProps}
         sx={[dragActive && styles.dragActive]}
      >
         <LoadingButton
            color="primary"
            sx={styles.btn}
            disabled={isLoading}
            startIcon={<UploadIcon />}
            {...baseButtonProps}
         >
            Upload CV
         </LoadingButton>
      </FileUploader>
   )
}

type ApplyButtonProps = {
   job: Job
   livestreamId: string
}

const ApplyButton: FC<ApplyButtonProps> = ({ job, livestreamId }) => {
   const [alreadyApplied, setAlreadyApplied] = useState(false)

   const { userData } = useAuth()

   const { applyJob, isLoading } = useJobApply(
      userData,
      job,
      livestreamId,
      alreadyApplied,
      setAlreadyApplied
   )

   return (
      <LoadingButton
         color="primary"
         sx={styles.btn}
         {...baseButtonProps}
         loading={isLoading}
         disabled={alreadyApplied}
         onClick={applyJob}
         startIcon={alreadyApplied ? <CheckIcon /> : null}
      >
         {alreadyApplied ? "Applied" : "Apply now"}
      </LoadingButton>
   )
}

const ClosedJobButton: FC = () => {
   return (
      <Button disabled color="primary" sx={styles.btn} {...baseButtonProps}>
         Application Closed
      </Button>
   )
}

const ButtonSkeleton: FC = () => {
   return (
      <LoadingButton
         disabled
         sx={[styles.btn, styles.loadingBtn]}
         {...baseButtonProps}
      >
         Hidden text
      </LoadingButton>
   )
}

export const GoBackButton: FC = () => {
   const { handleBack } = useLiveStreamDialog()

   return (
      <Button
         variant="contained"
         sx={[styles.goBackBtn, styles.btn]}
         onClick={handleBack}
         {...baseButtonProps}
      >
         Back
      </Button>
   )
}

const baseButtonProps: ButtonProps = {
   variant: "contained",
   color: "primary",
   disableElevation: true,
   size: "small",
}

export default JobCTAButton
