import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { Button } from "@mui/material"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { maybePluralize } from "components/helperFunctions/HelperFunctions"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
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
      excludeExpired: true,
   })

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()
   const dispatch = useDispatch()
   const { trackEvent } = useSparksFeedTracker()

   const handleClick = (event: React.MouseEvent) => {
      handleOpenDialog()
      trackEvent(SparkEventActions.Click_JobCTA, {
         jobIds: jobs?.map((job) => job.id) || [],
      })
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
               {`${jobs.length} ${maybePluralize(
                  jobs.length,
                  "job opening"
               )} available, check now`}
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
