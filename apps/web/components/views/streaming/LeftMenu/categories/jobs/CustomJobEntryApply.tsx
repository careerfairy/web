import { Button, CircularProgress } from "@mui/material"
import { ExternalLink } from "react-feather"
import React, { useCallback } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useCustomJobApply from "../../../../../custom-hook/custom-job/useCustomJobApply"

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
   handleApplyClick: () => void
}

const CustomJobEntryApply = ({
   job,
   livestreamId,
   handleApplyClick,
}: Props) => {
   const { handleClickApplyBtn, isClickingOnApplyBtn } = useCustomJobApply(
      job,
      livestreamId
   )

   const handleClick = useCallback(async () => {
      await handleClickApplyBtn()
      handleApplyClick()
   }, [handleClickApplyBtn, handleApplyClick])

   return (
      <>
         <Button
            sx={styles.btn}
            component={"a"}
            href={job.postingUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="primary"
            startIcon={
               isClickingOnApplyBtn ? (
                  <CircularProgress size={20} color="inherit" />
               ) : (
                  <ExternalLink size={18} />
               )
            }
            onClick={handleClick}
         >
            {isClickingOnApplyBtn ? "Applying" : "Apply now"}
         </Button>
      </>
   )
}

export default CustomJobEntryApply
