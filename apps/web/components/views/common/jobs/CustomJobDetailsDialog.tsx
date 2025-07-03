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
   Stack,
   SxProps,
} from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJob from "components/custom-hook/custom-job/useCustomJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import { ProfileRemoveCustomJobConfirmation } from "components/views/jobs/components/custom-jobs/ProfileRemoveCustomJobConfirmation"
import CustomJobDetailsSkeleton from "components/views/jobs/components/custom-jobs/skeletons/CustomJobDetailsSkeleton"
import { ReactNode } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import { ResponsiveDialogLayout } from "../ResponsiveDialog"
import {
   CustomJobDetailsProvider,
   useCustomJobDetailsDialog,
} from "./CustomJobDetailsProvider"
import { CustomJobNotFoundView } from "./CustomJobNotFound"

const styles = sxStyles({
   fixedBottomContent: {
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
   },
   jobApplyConfirmationDialog: {
      bottom: 16,
      mx: 2,
   },
   dialogContent: {
      p: 0,
      m: 0,
   },
   customJobDetailsView: {
      pt: "0px !important",
   },
   inlineCustomJobDetailsView: {
      p: "0px !important",
   },
   inlineActions: {
      p: "16px",
      background: (theme) => theme.brand.white[200],
      borderTop: (theme) => `1px solid ${theme.brand.black[300]}`,
   },
   dialogHeader: {
      py: "0px !important",
      px: {
         xs: "16px !important",
         sm: "16px !important",
         md: "24px !important",
      },
   },
   header: {
      py: "0px !important",
      px: "16px !important",
   },
   inlineHeader: {
      p: "12px !important",
   },
   inlineContentWrapper: {
      overflow: "scroll",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
      maxHeight: "720px",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
         display: "none",
      },
   },
   notFoundWrapper: {
      border: "none",
   },
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
   suspense?: boolean
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
   suspense,
   onClose,
}: Props) => {
   const isMobile = useIsMobile()
   const hasInitialData =
      serverSideCustomJob && customJobId === serverSideCustomJob?.id

   const customJob = useCustomJob(
      customJobId,
      hasInitialData ? { initialData: serverSideCustomJob } : undefined
   )

   if (!customJob) {
      return (
         <>
            <DialogContent sx={styles.dialogContent}>
               <CustomJobNotFoundView rootSx={styles.notFoundWrapper} />
            </DialogContent>
            <DialogActions sx={styles.fixedBottomContent}>
               <Button
                  fullWidth={isMobile}
                  variant="contained"
                  onClick={onClose}
               >
                  Back
               </Button>
            </DialogActions>
         </>
      )
   }

   return (
      <CustomJobDetailsProvider
         customJob={customJob}
         source={source}
         hideApplicationConfirmation={hideApplicationConfirmation}
         hideLinkedLivestreams={hideLinkedLivestreams}
         hideLinkedSparks={hideLinkedSparks}
         suspense={suspense}
      >
         <DialogContent sx={styles.dialogContent}>
            <Content
               heroContent={heroContent}
               heroSx={heroSx}
               headerSx={styles.dialogHeader}
               sx={{
                  p: "0px !important",
               }}
            />
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <Actions />
         </DialogActions>
      </CustomJobDetailsProvider>
   )
}

type ContentProps = {
   heroContent?: ReactNode
   heroSx?: SxProps<DefaultTheme>
   headerSx?: SxProps<DefaultTheme>
   sx?: SxProps<DefaultTheme>
}

export const Content = ({
   heroContent,
   heroSx,
   headerSx,
   sx,
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
      group,
      suspense,
      hideApplicationConfirmation,
      hideLinkedLivestreams,
      hideLinkedSparks,
      hideCTAButtons,
   } = useCustomJobDetailsDialog()

   return (
      <>
         <CustomJobDetailsView
            job={customJob}
            heroContent={heroContent}
            applicationInitiatedOnly={applicationInitiatedOnly}
            heroSx={heroSx}
            sx={combineStyles(styles.customJobDetailsView, sx)}
            companyLogoUrl={group?.logoUrl}
            headerSx={combineStyles(styles.header, headerSx)}
            companyName={group?.universityName}
            hideLinkedLivestreams={hideLinkedLivestreams}
            hideLinkedSparks={hideLinkedSparks}
            suspense={suspense}
            hideCTAButtons={hideCTAButtons}
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

type InlineDetailsContentProps = ContentProps & {
   customJob: CustomJob
   source: CustomJobApplicationSource
}

export const InlineCustomJobDetailsContent = (
   props: InlineDetailsContentProps
) => {
   if (!props.customJob) {
      return (
         <Box sx={{ p: 2 }}>
            <CustomJobNotFoundView />
         </Box>
      )
   }

   return (
      <CustomJobDetailsProvider
         customJob={props.customJob}
         source={props.source}
         hideCTAButtons
         suspense={false}
      >
         <Stack spacing={0} alignItems={"space-between"} height={"100%"}>
            <Box sx={styles.inlineContentWrapper}>
               <Content
                  {...props}
                  sx={styles.inlineCustomJobDetailsView}
                  headerSx={styles.inlineHeader}
               />
            </Box>
            <Box sx={styles.inlineActions}>
               <Actions />
            </Box>
         </Stack>
      </CustomJobDetailsProvider>
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
