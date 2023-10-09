import { Button, CircularProgress } from "@mui/material"
import { ExternalLink } from "react-feather"
import React, { useCallback, useState } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"

const styles = sxStyles({
   btn: {
      height: 30,
      textTransform: "none",
      ml: 2,
   },
})

type Props = {
   job: PublicCustomJob
}

const CustomJobEntryApply = ({ job }: Props) => {
   // hook to get if the user already applied to this job
   const [isApplyingToCustomJob, setIsApplyingToCustomJob] = useState(false)

   const handleApply = useCallback(() => {}, [])
   return (
      <Button
         sx={styles.btn}
         variant="contained"
         color="primary"
         startIcon={
            isApplyingToCustomJob ? (
               <CircularProgress size={20} color="inherit" />
            ) : (
               <ExternalLink size={18} />
            )
         }
         onClick={handleApply}
      >
         {isApplyingToCustomJob ? "Applying" : "Apply now"}
      </Button>
   )
}

export default CustomJobEntryApply
