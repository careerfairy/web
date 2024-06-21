import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Button, CircularProgress } from "@mui/material"
import { FC, useCallback } from "react"
import { ExternalLink } from "react-feather"
import DateUtil from "util/DateUtil"
import { sxStyles } from "../../../../../../types/commonTypes"
import useCustomJobApply from "../../../../../custom-hook/custom-job/useCustomJobApply"

const styles = sxStyles({
   btn: {
      textTransform: "none",
   },
})

type Props = {
   job: PublicCustomJob
   livestreamId: string
   handleApplyClick: () => void
   isSecondary?: boolean
}

const CustomJobEntryApply = ({
   job,
   livestreamId,
   handleApplyClick,
   isSecondary,
}: Props) => {
   const { handleClickApplyBtn, isClickingOnApplyBtn } = useCustomJobApply(
      job,
      livestreamId
   )

   const handleClick = useCallback(async () => {
      await handleClickApplyBtn()
      handleApplyClick()
   }, [handleClickApplyBtn, handleApplyClick])

   if (job.deadline && DateUtil.isDeadlineExpired(job.deadline.toDate())) {
      return <ApplicationExpiredButton />
   }

   return (
      <>
         <Button
            sx={styles.btn}
            component={"a"}
            href={job.postingUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant={isSecondary ? "outlined" : "contained"}
            color={"primary"}
            fullWidth
            endIcon={
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

const ApplicationExpiredButton: FC = () => {
   return (
      <Button
         fullWidth
         disabled
         variant="contained"
         color="primary"
         sx={styles.btn}
      >
         Application deadline expired
      </Button>
   )
}

export default CustomJobEntryApply
