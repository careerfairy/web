import {
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Button, CircularProgress } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import { FC, useCallback } from "react"
import { CheckCircle, ExternalLink } from "react-feather"
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
   applicationSource: CustomJobApplicationSource
   handleApplyClick: () => void
   isSecondary?: boolean
}

const CustomJobEntryApply = ({
   job,
   applicationSource,
   handleApplyClick,
   isSecondary,
}: Props) => {
   const { userData } = useAuth()
   const { handleClickApplyBtn, isClickingOnApplyBtn } = useCustomJobApply(
      job,
      applicationSource
   )

   const { alreadyApplied } = useUserJobApplication(userData?.id, job.id)

   const handleClick = useCallback(async () => {
      await handleClickApplyBtn()
      handleApplyClick()
   }, [handleClickApplyBtn, handleApplyClick])

   if (alreadyApplied) {
      return <ApplicationAlreadySentButton />
   }

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
         Job expired
      </Button>
   )
}

const ApplicationAlreadySentButton: FC = () => {
   return (
      <Button
         fullWidth
         disabled
         variant="contained"
         color="primary"
         sx={styles.btn}
         endIcon={<CheckCircle />}
      >
         Application sent
      </Button>
   )
}

export default CustomJobEntryApply
