import {
   Box,
   Button,
   CircularProgress,
   Dialog,
   DialogContent,
   Typography,
} from "@mui/material"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useCustomJobApply from "../../../../../custom-hook/useCustomJobApply"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import { sxStyles } from "../../../../../../types/commonTypes"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import React, { useCallback } from "react"
import { HelpCircle } from "react-feather"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      flexDirection: "column",
   },
   headerContent: {
      display: "flex",
      alignSelf: "center",
   },
   closeBtn: {
      position: "absolute",
      top: 0,
      right: 0,
      m: 2,
   },
   content: {
      display: "flex",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
   },
   message: {
      mt: { xs: 8, md: 2 },
      mb: 4,
   },
   messageText: {
      fontWeight: 600,
      fontSize: "24px !important",
      textAlign: "center",
   },
   btn: {
      mx: 2,
      height: "40px",
   },
   noBtn: {
      color: "text.secondary",
   },
   actions: {
      display: "flex",
      height: "100%",
      alignItems: "center",
   },
   helpIcon: {
      mt: { xs: 8, md: 0 },
      "& svg": {
         color: (theme) => theme.palette.primary.main,
      },
   },
})

type Props = {
   handleClose: () => void
   job: PublicCustomJob
   livestreamId: string
   open: boolean
}
const CustomJobApplyConfirmationDialog = ({
   open,
   handleClose,
   job,
   livestreamId,
}: Props) => {
   const { handleApply, alreadyApplied, isApplying } = useCustomJobApply(
      job,
      livestreamId
   )
   const isMobile = useIsMobile()

   const handleClick = useCallback(async () => {
      await handleApply()
      handleClose()
   }, [handleApply, handleClose])

   if (alreadyApplied) {
      handleClose()
   }

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         maxWidth={"xs"}
         fullWidth
         fullScreen={isMobile}
      >
         <DialogContent sx={styles.wrapper}>
            <Box sx={styles.headerContent}>
               <Box sx={styles.closeBtn}>
                  <IconButton
                     color="inherit"
                     onClick={handleClose}
                     aria-label="close"
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>

               <Box sx={styles.helpIcon}>
                  <HelpCircle size={isMobile ? 120 : 80} />
               </Box>
            </Box>
            <Box sx={styles.content}>
               <Box sx={styles.message}>
                  <Typography variant={"h5"} sx={styles.messageText}>
                     {`Did you apply to ${job.title}?`}
                  </Typography>
               </Box>

               <Box sx={styles.actions}>
                  <Button
                     sx={[styles.btn, styles.noBtn]}
                     variant="outlined"
                     color="grey"
                     onClick={handleClose}
                  >
                     No
                  </Button>

                  <Button
                     sx={styles.btn}
                     variant="contained"
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
         </DialogContent>
      </Dialog>
   )
}

export default CustomJobApplyConfirmationDialog
