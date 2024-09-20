import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Button } from "@mui/material"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import JobDialog from "./job-dialog"

type Props = {
   spark: SparkPresenter
}

const SparkJobButton = ({ spark }: Props) => {
   const jobs: CustomJob[] = useGroupCustomJobs(spark.group.id, {
      sparkId: spark.id,
   })
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const handleClick = (event: React.MouseEvent) => {
      handleOpenDialog()
      event.stopPropagation()
   }

   if (jobs?.length) {
      return (
         <>
            <Button
               variant="contained"
               color="primary"
               sx={{ borderRadius: "8px" }}
               onClick={handleClick}
               fullWidth
            >
               {jobs.length} job openings available, check now
            </Button>

            <JobDialog
               isOpen={isDialogOpen}
               handleClose={handleCloseDialog}
               jobs={jobs}
               spark={spark}
            />
         </>
      )
   }
   return null
}

export default SparkJobButton
