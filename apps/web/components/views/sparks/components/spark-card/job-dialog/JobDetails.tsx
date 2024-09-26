import {
   CustomJob,
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import CloseIcon from "@mui/icons-material/Close"
import { Box, IconButton } from "@mui/material"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   hero: {
      pt: "8px !important",
      px: "16px !important",
      pb: "0 !important",
   },
   content: {
      pt: "0 !important",
   },
   closeIcon: {
      display: "flex",
      justifyContent: "end",

      "& svg": {
         width: { xs: "32px", md: "24px" },
         height: { xs: "32px", md: "24px" },
         color: "black.main",
      },
   },
   dialogContent: {
      p: "0 !important",
   },
   applyConfirmation: {
      bottom: 100,
   },
})

type Props = {
   job: CustomJob
   spark: SparkPresenter
}

const JobDetails = ({ job, spark }: Props) => {
   const applicationSource: CustomJobApplicationSource = {
      id: spark.id,
      source: CustomJobApplicationSourceTypes.Spark,
   }

   const { applicationInitiatedOnly } = useCustomJobApply(
      job,
      applicationSource
   )
   const [
      isApplyConfirmationOpen,
      handleConfirmationOpen,
      handleConfirmationClose,
   ] = useDialogStateHandler(applicationInitiatedOnly)

   return (
      <>
         <SteppedDialog.Container
            sx={styles.dialogContent}
            withActions
            hideCloseButton
         >
            <CustomJobDetailsView
               sx={styles.content}
               job={job}
               companyName={spark.group.universityName}
               companyLogoUrl={spark.group.logoUrl}
               context={applicationSource}
               heroContent={<Hero />}
               heroSx={styles.hero}
               isApplyConfirmationOpen={isApplyConfirmationOpen}
               handleApplyConfirmationClose={handleConfirmationClose}
               applyConfirmationSx={styles.applyConfirmation}
            />
         </SteppedDialog.Container>
         <SteppedDialog.Actions>
            <CustomJobCTAButtons
               applicationSource={applicationSource}
               job={job}
               handleApplyClick={handleConfirmationOpen}
            />
         </SteppedDialog.Actions>
      </>
   )
}

export default JobDetails

const Hero = () => {
   const { moveToPrev } = useStepper()
   return (
      <Box sx={styles.closeIcon}>
         <IconButton onClick={moveToPrev}>
            <CloseIcon />
         </IconButton>
      </Box>
   )
}
