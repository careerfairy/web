import {
   CustomJob,
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import { props } from "lodash/fp"
import { ReactNode, forwardRef } from "react"
import { useSelector } from "react-redux"
import { useEffectOnce, useMeasure } from "react-use"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerCustomJobEvent } from "util/analyticsUtils"
import { combineStyles, sxStyles } from "../../../../../types/commonTypes"
import CustomJobCTAButtons from "./CustomJobCTAButtons"
import CustomJobDescription from "./CustomJobDescription"
import CustomJobHeader from "./CustomJobHeader"
import CustomJobLinkedContents from "./CustomJobLinkedContents"
import CustomJobDetailsSkeleton from "./skeletons/CustomJobDetailsSkeleton"

const responsiveBreakpoint = "md"

const customStyles = sxStyles({
   root: {
      p: {
         xs: 2,
         [responsiveBreakpoint]: 3,
      },
   },
   content: {
      mt: "24px",
   },
   fixedBottomContent: {
      position: "fixed",
      bottom: 0,
      width: "100%",
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
      display: "flex",
   },
   noDivider: {
      borderTop: "none",
   },
})

type Props = {
   job: CustomJob
   applicationInitiatedOnly?: boolean
   context?: CustomJobApplicationSource
   heroContent?: ReactNode
   sx?: SxProps<DefaultTheme>
   heroSx?: SxProps<DefaultTheme>
   hideBottomDivider?: boolean
   disabledLinkedContentClick?: boolean
   handleEdit?: () => void
   onApply?: () => void
   hideCTAButtons?: boolean
   companyName?: string
   companyLogoUrl?: string
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
}

const CustomJobDetailsView = (props: Props) => {
   return (
      <SuspenseWithBoundary
         fallback={
            <CustomJobDetailsSkeleton heroContent={!!props.heroContent} />
         }
      >
         <CustomJobDetails {...props} />
      </SuspenseWithBoundary>
   )
}

export const CustomJobDetails = ({
   job,
   applicationInitiatedOnly,
   handleEdit,
   companyLogoUrl,
   companyName,
   context,
   heroContent,
   disabledLinkedContentClick,
   sx,
   heroSx,
   hideBottomDivider,
   hideCTAButtons,
   onApply,
   hideLinkedLivestreams,
   hideLinkedSparks,
}: Props) => {
   const { applicationInitiatedOnly: applicationInitiated } = useCustomJobApply(
      job as PublicCustomJob,
      context
   )

   const [isOpen, handleOpen, handleClose] = useDialogStateHandler(
      applicationInitiatedOnly || applicationInitiated
   )

   const [ref, { height }] = useMeasure()

   const autoActionType = useSelector(autoAction)
   const isMobile = useIsMobile()
   const isAutoApply = autoActionType === AutomaticActions.APPLY

   useEffectOnce(() => {
      dataLayerCustomJobEvent(AnalyticsEvents.CustomJobView, job, companyName)
   })

   return (
      <>
         <Box sx={combineStyles(customStyles.root, heroSx)}>{heroContent}</Box>
         <Stack spacing={4.75} sx={combineStyles(customStyles.root, sx)}>
            <Box>
               <CustomJobHeader
                  job={job}
                  companyName={companyName}
                  companyLogoUrl={companyLogoUrl}
                  editMode={!!handleEdit}
                  handleClick={handleEdit}
               />

               <Box sx={customStyles.content}>
                  <Stack spacing={2}>
                     <CustomJobDescription job={job} />
                     <CustomJobLinkedContents
                        job={job}
                        disableEventClick={disabledLinkedContentClick}
                        hideLinkedLivestreams={hideLinkedLivestreams}
                        hideLinkedSparks={hideLinkedSparks}
                     />
                  </Stack>
               </Box>

               {!hideCTAButtons && context && isOpen ? (
                  <CustomJobApplyConfirmation
                     handleClose={handleClose}
                     job={job as PublicCustomJob}
                     applicationSource={context}
                     autoApply={isAutoApply}
                     onApply={onApply}
                     sx={{
                        bottom:
                           isMobile && context.source == "livestream"
                              ? "150px"
                              : "100px",
                     }}
                  />
               ) : null}
            </Box>
         </Stack>
         {!hideCTAButtons && context ? (
            <>
               <CustomJobCTABottomContent
                  hideBottomDivider={hideBottomDivider}
                  ref={ref}
               >
                  <CustomJobCTAButtons
                     applicationSource={context}
                     job={job as PublicCustomJob}
                     handleApplyClick={handleOpen}
                     {...props}
                  />
               </CustomJobCTABottomContent>
               <Box height={`calc(${height}px + 40px)`} />
            </>
         ) : null}
      </>
   )
}

type CustomJobCTABottomContentProps = {
   children: ReactNode
   hideBottomDivider: boolean
}

export const CustomJobCTABottomContent = forwardRef<
   HTMLDivElement,
   CustomJobCTABottomContentProps
>(function CustomJobCTABottomContent({ children, hideBottomDivider }, ref) {
   return (
      <Box
         ref={ref}
         sx={[
            customStyles.fixedBottomContent,
            hideBottomDivider && customStyles.noDivider,
         ]}
      >
         {children}
      </Box>
   )
})

export default CustomJobDetailsView
