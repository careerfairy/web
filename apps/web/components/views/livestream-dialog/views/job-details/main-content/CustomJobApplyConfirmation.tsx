import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import React, { useCallback } from "react"
import { HelpCircle } from "react-feather"
import { Button, CircularProgress, Typography } from "@mui/material"
import useCustomJobApply from "../../../../../custom-hook/useCustomJobApply"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { useLiveStreamDialog } from "../../../LivestreamDialog"

const styles = sxStyles({
   confirmationWrapper: {
      position: "fixed",
      display: "flex",
      bottom: "100px",
      width: "92%",
      padding: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: "12px",
      border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
      background: "white",
      boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.05)",
   },
   noBtn: {
      color: "text.secondary",
   },
   info: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: (theme) => theme.palette.primary.main,
      },
   },
   btn: {
      textTransform: "none",
      height: "40px",
      padding: "12px 30px",
   },
   message: {},
})

type Props = {
   handleClose: () => void
   job: PublicCustomJob
   livestreamId: string
}
const CustomJobApplyConfirmation = ({
   handleClose,
   job,
   livestreamId,
}: Props) => {
   const { goToView } = useLiveStreamDialog()
   const { handleApply, alreadyApplied, isApplying } = useCustomJobApply(
      job,
      livestreamId
   )

   const handleClick = useCallback(async () => {
      await handleApply()
      goToView("livestream-details")
   }, [goToView, handleApply])

   if (alreadyApplied) {
      handleClose()
   }

   return (
      <Box sx={styles.confirmationWrapper}>
         <Box sx={styles.info}>
            <HelpCircle size={28} />
            <Typography variant={"h6"} ml={2}>
               {" "}
               Did you apply to{" "}
            </Typography>
            <Typography variant={"h6"} fontWeight={"bold"} ml={1}>
               {job.title}?
            </Typography>
         </Box>

         <Box>
            <Button
               sx={[styles.btn, styles.noBtn]}
               variant="text"
               color="grey"
               onClick={handleClose}
            >
               No
            </Button>

            <Button
               sx={styles.btn}
               variant="text"
               color="primary"
               onClick={handleClick}
               startIcon={
                  isApplying ? (
                     <CircularProgress size={20} color="inherit" />
                  ) : null
               }
            >
               Yes
            </Button>
         </Box>
      </Box>
   )
}

export default CustomJobApplyConfirmation
