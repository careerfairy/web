import { Box, Stack, SxProps } from "@mui/material"

import {
   CustomJob,
   JobApplicationContext,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import { props } from "lodash/fp"
import { ReactNode, forwardRef } from "react"
import { useSelector } from "react-redux"
import { useMeasure } from "react-use"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
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
         xs: 1,
         [responsiveBreakpoint]: 2.25,
      },
   },
   content: {
      mt: 4,
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
   jobApplyConfirmationDialog: {
      bottom: "100px",
   },
})

type Props = {
   job: CustomJob
   context?: JobApplicationContext
   heroContent?: ReactNode
   sx?: SxProps<DefaultTheme>
   hideBottomDivider?: boolean
   disabledLinkedContentClick?: boolean
   handleEdit?: () => void
   onApply?: () => void
   hideCTAButtons?: boolean
   companyName: string
   companyLogoUrl: string
}

const CustomJobDetailsView = (props: Props) => {
   if (!props.job)
      return <CustomJobDetailsSkeleton heroContent={!!props.heroContent} />

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

const CustomJobDetails = ({
   job,
   handleEdit,
   companyLogoUrl,
   companyName,
   context,
   heroContent,
   disabledLinkedContentClick,
   sx,
   hideBottomDivider,
   onApply,
}: Props) => {
   const { userData } = useAuth()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()
   const { applicationInitiatedOnly } = useUserJobApplication(
      userData?.id,
      job.id
   )
   const [ref, { height }] = useMeasure()

   const autoActionType = useSelector(autoAction)

   const isAutoApply = autoActionType === AutomaticActions.APPLY

   return (
      <>
         <Stack spacing={4.75} sx={combineStyles(customStyles.root, sx)}>
            {heroContent}
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
                     />
                  </Stack>
               </Box>

               {context && (isOpen || applicationInitiatedOnly) ? (
                  <CustomJobApplyConfirmation
                     handleClose={handleClose}
                     job={job as PublicCustomJob}
                     applicationContext={context}
                     autoApply={isAutoApply}
                     onApply={onApply}
                     sx={customStyles.jobApplyConfirmationDialog}
                  />
               ) : null}
            </Box>
         </Stack>
         {context ? (
            <>
               <CustomJobCTABottomContent
                  hideBottomDivider={hideBottomDivider}
                  ref={ref}
               >
                  <CustomJobCTAButtons
                     applicationContext={context}
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
