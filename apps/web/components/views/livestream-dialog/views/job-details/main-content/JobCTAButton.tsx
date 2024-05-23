import { Job } from "@careerfairy/shared-lib/ats/Job"
import UploadIcon from "@mui/icons-material/CloudUploadOutlined"
import LoadingButton from "@mui/lab/LoadingButton"
import { ButtonProps } from "@mui/material"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { useRouter } from "next/router"
import { FC, useState } from "react"
import { Trash2 as DeleteIcon, Eye } from "react-feather"

import useDeleteCV from "components/custom-hook/user/useDeleteCV"
import { CircularButton } from "components/views/streaming-page/components/TopBar/CircularButton"
import { CheckCircle, FileText, UploadCloud } from "react-feather"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import useJobApply from "../../../../../custom-hook/ats/useJobApply"
import useUploadCV from "../../../../../custom-hook/user/useUploadCV"
import FileUploader from "../../../../common/FileUploader"
import Link from "../../../../common/Link"

const styles = sxStyles({
   loadingBtn: {
      color: "transparent !important",
   },
   manageCvButton: (theme) => ({
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: `1px solid ${theme.palette.neutral[200]}`,
      color: theme.brand.black["700"],
      height: "auto",
      width: "auto",
   }),
   dragActive: {
      backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
      border: "none",
   },
   menuOption: {
      color: (theme) => theme.palette.neutral[700],
      textDecoration: "none",
   },
   deleteOption: {
      color: "error.main",
   },
})

type Props = {
   job: Job
   livestreamId: string
   isSecondary: boolean
}

const JobCTAButton: FC<Props> = ({ job, livestreamId, isSecondary }) => {
   const { userPresenter, isLoggedOut, authenticatedUser } = useAuth()

   if (job.isClosed()) {
      return <ClosedJobButton />
   }

   if (!authenticatedUser.isLoaded) {
      return <ButtonSkeleton />
   }

   if (isLoggedOut) {
      return <SignUpButton />
   }

   if (userPresenter.hasResume()) {
      return (
         <SuspenseWithBoundary>
            <ApplyButton
               job={job}
               livestreamId={livestreamId}
               isSecondary={isSecondary}
            />
         </SuspenseWithBoundary>
      )
   }

   return <UploadCVButton isSecondary={isSecondary} />
}

const SignUpButton: FC = () => {
   const { asPath } = useRouter()

   return (
      // @ts-ignore
      <Button
         href={`/signup?absolutePath=${asPath}`}
         color="primary"
         {...baseButtonProps}
         component={Link}
      >
         Sign Up
      </Button>
   )
}

const UploadCVButton: FC<{ isSecondary: boolean }> = ({ isSecondary }) => {
   const { fileUploaderProps, dragActive, isLoading } = useUploadCV()

   return (
      <FileUploader
         {...fileUploaderProps}
         sx={[dragActive && styles.dragActive]}
      >
         <LoadingButton
            disabled={isLoading}
            startIcon={<UploadIcon />}
            {...baseButtonProps}
            color={isSecondary ? "grey" : "primary"}
            variant={isSecondary ? "text" : "contained"}
            size="medium"
         >
            Upload CV
         </LoadingButton>
      </FileUploader>
   )
}

const ManageCVButton = () => {
   const { userData } = useAuth()
   const { anchorEl, handleClick, handleClose } = useMenuState()
   const { fileUploaderProps, dragActive, isLoading } = useUploadCV({
      onSuccess: handleClose,
   })
   const { handleDeleteCV, isLoadingDelete } = useDeleteCV({
      onSuccess: handleClose,
   })

   const open = Boolean(anchorEl)

   const options: MenuOption[] = [
      {
         label: "View current CV",
         icon: <Eye />,
         handleClick: () => {},
         menuItemSxProps: [styles.menuOption],
         wrapperComponent: ({ children, ...props }) => (
            <Link
               href={userData.userResume}
               target="_blank"
               sx={styles.menuOption}
               {...props}
            >
               {children}
            </Link>
         ),
      },
      {
         label: "Upload new CV",
         icon: <UploadCloud />,

         menuItemSxProps: [styles.menuOption],
         loading: isLoading,
         handleClick: () => {},
         keepOpen: true,
         wrapperComponent: ({ children, ...props }) => (
            <FileUploader
               {...fileUploaderProps}
               sx={[dragActive && styles.dragActive]}
               disabled={false}
               {...props}
            >
               {children}
            </FileUploader>
         ),
      },
      {
         label: "Delete your CV",
         icon: <DeleteIcon />,
         handleClick: () => {
            handleDeleteCV()
         },
         keepOpen: true,
         menuItemSxProps: [styles.deleteOption],
         loading: isLoadingDelete,
      },
   ]
   return (
      <>
         <CircularButton
            sx={styles.manageCvButton}
            size="medium"
            onClick={handleClick}
         >
            <FileText size={18} />
         </CircularButton>

         <BrandedResponsiveMenu
            options={options}
            open={open}
            handleClose={handleClose}
            anchorEl={anchorEl}
            placement="top"
         />
      </>
   )
}

type ApplyButtonProps = {
   job: Job
   livestreamId: string
   isSecondary: boolean
}

const ApplyButton: FC<ApplyButtonProps> = ({
   job,
   livestreamId,
   isSecondary,
}) => {
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
      <>
         {!alreadyApplied && <ManageCVButton />}
         <LoadingButton
            {...baseButtonProps}
            color={isSecondary ? "grey" : "primary"}
            variant={isSecondary ? "text" : "contained"}
            loading={isLoading}
            disabled={alreadyApplied}
            onClick={applyJob}
            endIcon={alreadyApplied ? <CheckCircle /> : null}
            startIcon={alreadyApplied ? null : <CheckCircle />}
            size="medium"
         >
            {alreadyApplied ? "Application sent" : "Apply now!"}
         </LoadingButton>
      </>
   )
}

const ClosedJobButton: FC = () => {
   return (
      <Button disabled color="primary" {...baseButtonProps}>
         Application Closed
      </Button>
   )
}

const ButtonSkeleton: FC = () => {
   return (
      <LoadingButton disabled sx={styles.loadingBtn} {...baseButtonProps}>
         Hidden text
      </LoadingButton>
   )
}

const baseButtonProps: ButtonProps = {
   variant: "contained",
   color: "primary",
   disableElevation: true,
   size: "small",
}

export default JobCTAButton
