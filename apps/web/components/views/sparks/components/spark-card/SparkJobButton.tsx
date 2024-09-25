import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Button } from "@mui/material"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setIsJobDialogOpen } from "store/reducers/sparksFeedReducer"
import { sxStyles } from "types/commonTypes"
import JobDialog from "./job-dialog"

type Props = {
   spark: SparkPresenter
}

const styles = sxStyles({
   btn: {
      borderRadius: "8px",
      px: 0,

      "@media (max-height: 800px)": {
         fontSize: "14px",
      },
   },
})

const SparkJobButton = ({ spark }: Props) => {
   const jobs: CustomJob[] = useGroupCustomJobs(spark.group.id, {
      sparkId: spark.id,
   })
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()
   const dispatch = useDispatch()

   const handleClick = (event: React.MouseEvent) => {
      handleOpenDialog()
      event.stopPropagation()
   }

   useEffect(() => {
      dispatch(setIsJobDialogOpen(isDialogOpen))
   }, [dispatch, isDialogOpen])

   if (jobs?.length) {
      return (
         <>
            <Button
               variant="contained"
               color="primary"
               sx={styles.btn}
               onClick={handleClick}
               fullWidth
            >
               {`${jobs.length} job opening${
                  jobs.length > 1 ? "s" : ""
               } available, check now`}
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
