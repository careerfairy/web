import {
   CustomJob,
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CloseOutlined } from "@mui/icons-material"
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   IconButton,
   SxProps,
} from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJob from "components/custom-hook/custom-job/useCustomJob"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import { ProfileRemoveCustomJobConfirmation } from "components/views/jobs/components/custom-jobs/ProfileRemoveCustomJobConfirmation"
import CustomJobDetailsSkeleton from "components/views/jobs/components/custom-jobs/skeletons/CustomJobDetailsSkeleton"
import { Fragment, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { ResponsiveDialogLayout } from "../ResponsiveDialog"
import {
   CustomJobDetailsProvider,
   useCustomJobDetailsDialog,
} from "./CustomJobDetailsProvider"
import { CustomJobNotFoundView } from "./CustomJobNotFoundView"

const styles = sxStyles({
   fixedBottomContent: {
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
   },
   jobApplyConfirmationDialog: {
      m: 2,
      bottom: 10,
   },
   dialogContent: {
      p: 0,
      m: 0,
   },
   customJobDetailsView: { pt: "0px !important" },
})

type Props = {
   isOpen: boolean
   customJobId: string
   serverSideCustomJob?: CustomJob
   source?: CustomJobApplicationSource
   onClose?: () => void
   heroContent?: ReactNode
   heroSx?: SxProps<DefaultTheme>
   paperPropsSx?: SxProps<DefaultTheme>
   hideApplicationConfirmation?: boolean
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
}

const CustomJobDetailsDialog = (props: Props) => {
   const handleClose = () => {
      props.onClose?.()
   }

   return (
      <ResponsiveDialogLayout open={props.isOpen} handleClose={handleClose}>
         {props.customJobId ? <DialogDetails {...props} /> : null}
      </ResponsiveDialogLayout>
   )
}

const DialogDetails = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CustomJobDetailsSkeleton />}>
         <DialogDetailsContent {...props} />
      </SuspenseWithBoundary>
   )
}

const DialogDetailsContent = ({
   customJobId,
   serverSideCustomJob,
   source,
   heroContent,
   heroSx,
   hideApplicationConfirmation,
   hideLinkedLivestreams,
   hideLinkedSparks,
   onClose,
}: Props) => {
   const hasInitialData =
      serverSideCustomJob && customJobId === serverSideCustomJob?.id

   const customJob = useCustomJob(
      customJobId,
      hasInitialData ? serverSideCustomJob : undefined
   )

   if (!customJob) return <CustomJobNotFound onClose={onClose} />

   return (
      <CustomJobDetailsProvider customJob={customJob} source={source}>
         <DialogContent sx={styles.dialogContent}>
            <Content
               heroContent={heroContent}
               heroSx={heroSx}
               hideApplicationConfirmation={hideApplicationConfirmation}
               hideLinkedLivestreams={hideLinkedLivestreams}
               hideLinkedSparks={hideLinkedSparks}
            />
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <Actions />
         </DialogActions>
      </CustomJobDetailsProvider>
   )
}

type CustomJobNotFoundProps = {
   onClose: () => void
}

const CustomJobNotFound = ({ onClose }: CustomJobNotFoundProps) => {
   return (
      <Fragment>
         <DialogContent sx={styles.dialogContent}>
            <CustomJobNotFoundView
               title="No job found"
               description="The job you are looking for does not exist. It may have been deleted or closed or the link you followed may be broken."
            />
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <Button
               variant="contained"
               onClick={onClose}
               color="primary"
               disableElevation
               size="small"
            >
               Back
            </Button>
         </DialogActions>
      </Fragment>
   )
}

type ContentProps = {
   heroContent?: ReactNode
   heroSx?: SxProps<DefaultTheme>
   hideApplicationConfirmation?: boolean
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
}

export const Content = ({
   heroContent,
   heroSx,
   hideApplicationConfirmation,
   hideLinkedLivestreams,
   hideLinkedSparks,
}: ContentProps) => {
   const {
      customJob,
      source,
      isApplyConfirmationOpen,
      isRemoveConfirmationOpen,
      applicationInitiatedOnly,
      isAutoApply,
      handleConfirmationClose,
      handleRemoveJobClose,
   } = useCustomJobDetailsDialog()

   const {
      data: [group],
   } = useGroupsByIds([customJob.groupId])

   return (
      <>
         <CustomJobDetailsView
            job={customJob}
            heroContent={heroContent}
            applicationInitiatedOnly={applicationInitiatedOnly}
            heroSx={heroSx}
            sx={styles.customJobDetailsView}
            companyLogoUrl={group.logoUrl}
            companyName={group.universityName}
            hideLinkedLivestreams={hideLinkedLivestreams}
            hideLinkedSparks={hideLinkedSparks}
         />

         {!hideApplicationConfirmation && isApplyConfirmationOpen ? (
            <CustomJobApplyConfirmation
               handleClose={handleConfirmationClose}
               job={customJob as PublicCustomJob}
               applicationSource={source}
               autoApply={isAutoApply}
               sx={styles.jobApplyConfirmationDialog}
            />
         ) : null}

         <ProfileRemoveCustomJobConfirmation
            isOpen={Boolean(
               isRemoveConfirmationOpen &&
                  source.source == CustomJobApplicationSourceTypes.Profile
            )}
            handleClose={handleRemoveJobClose}
            job={customJob as PublicCustomJob}
            onRemove={handleRemoveJobClose}
         />
      </>
   )
}

export const Actions = () => {
   const { source, customJob, handleConfirmationOpen, handleRemoveJobOpen } =
      useCustomJobDetailsDialog()

   return (
      <CustomJobCTAButtons
         applicationSource={source}
         job={customJob as PublicCustomJob}
         handleApplyClick={() => {
            handleConfirmationOpen()
         }}
         handleRemoveClick={handleRemoveJobOpen}
      />
   )
}

type CloseButtonProps = {
   onClose: () => void
}

const CloseButton = ({ onClose }: CloseButtonProps) => {
   return (
      <Box display={"flex"} flexDirection={"row-reverse"} p={0} m={0}>
         <IconButton onClick={onClose}>
            <CloseOutlined />
         </IconButton>
      </Box>
   )
}

CustomJobDetailsDialog.CloseButton = CloseButton

export default CustomJobDetailsDialog
