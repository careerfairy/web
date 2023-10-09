import { Button, CircularProgress, Typography } from "@mui/material"
import { ExternalLink } from "react-feather"
import React, { useCallback } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import useCustomJobApply from "../../../../../custom-hook/useCustomJobApply"

const styles = sxStyles({
   btn: {
      height: 30,
      textTransform: "none",
      ml: 2,
   },
})

type Props = {
   job: PublicCustomJob
   livestreamId: string
   handleClose: () => void
}

const CustomJobEntryApply = ({ job, livestreamId, handleClose }: Props) => {
   const { alreadyApplied, handleApply, isApplying } = useCustomJobApply(
      job,
      livestreamId
   )

   const handleClick = useCallback(async () => {
      await handleApply()
      document.getElementById("toOpenANewTab").click()
      handleClose()
   }, [handleApply, handleClose])

   return (
      <>
         {alreadyApplied ? (
            <Typography fontWeight="bold" color="primary" variant="h6">
               Congrats! You have already applied to this job!
            </Typography>
         ) : (
            <Button
               sx={styles.btn}
               variant="contained"
               color="primary"
               startIcon={
                  isApplying ? (
                     <CircularProgress size={20} color="inherit" />
                  ) : (
                     <ExternalLink size={18} />
                  )
               }
               onClick={handleClick}
            >
               {isApplying ? "Applying" : "Apply now"}
            </Button>
         )}
         <a
            id={"toOpenANewTab"}
            href={job.postingUrl}
            target="_blank"
            rel="noopener noreferrer"
         />
      </>
   )
}

export default CustomJobEntryApply
