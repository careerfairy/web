import {
   CustomJob,
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import { ReactNode } from "react"
import { useSelector } from "react-redux"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
import { combineStyles, sxStyles } from "../../../../../types/commonTypes"
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
   confirmation: {
      marginTop: { xs: 2, md: 1 },
   },
})

type Props = {
   job: CustomJob
   context?: CustomJobApplicationSource
   heroContent?: ReactNode
   sx?: SxProps<DefaultTheme>
   heroSx?: SxProps<DefaultTheme>
   disabledLinkedContentClick?: boolean
   handleEdit?: () => void
   onApply?: () => void
   companyName?: string
   companyLogoUrl?: string
   isApplyConfirmationOpen?: boolean
   applyConfirmationSx?: SxProps<DefaultTheme>
   handleApplyConfirmationClose?: () => void
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
   handleEdit,
   companyLogoUrl,
   companyName,
   context,
   heroContent,
   disabledLinkedContentClick,
   sx,
   heroSx,
   isApplyConfirmationOpen,
   handleApplyConfirmationClose,
   onApply,
   applyConfirmationSx,
}: Props) => {
   const autoActionType = useSelector(autoAction)
   const isAutoApply = autoActionType === AutomaticActions.APPLY

   return (
      <>
         {heroContent ? (
            <Box sx={combineStyles(customStyles.root, heroSx)}>
               {heroContent}
            </Box>
         ) : null}
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
                     />
                  </Stack>
               </Box>

               {context && isApplyConfirmationOpen ? (
                  <CustomJobApplyConfirmation
                     handleClose={handleApplyConfirmationClose}
                     job={job as PublicCustomJob}
                     applicationSource={context}
                     autoApply={isAutoApply}
                     onApply={onApply}
                     sx={combineStyles(
                        customStyles.confirmation,
                        applyConfirmationSx
                     )}
                  />
               ) : null}
            </Box>
         </Stack>
      </>
   )
}

export default CustomJobDetailsView
