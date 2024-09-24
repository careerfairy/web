import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   Button,
   CircularProgress,
   Dialog,
   DialogContent,
   Stack,
   Typography,
   useTheme,
} from "@mui/material"
import useRemoveUserCustomJob from "components/custom-hook/custom-job/useRemoveUserCustomJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback } from "react"
import { XCircle } from "react-feather"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   dialogContent: {
      p: 3,
   },
   dialogMobile: {
      position: "fixed", // Fix the dialog at the bottom of the screen
      bottom: 0, // Align it to the bottom
      left: 0, // Ensure it starts from the left side of the screen
      right: 0, // Ensure it spans the entire width
      margin: "0", // Remove any external margin
      width: "100%", // Full width on mobile
      maxHeight: "none", // Allow content to dictate the height
      height: "auto", // Dynamically adjust the height based on content
      borderRadius: "12px 12px 0 0", // Optional rounded corners at the top
   },
   header: {
      fontWeight: 600,
      textAlign: "center",
   },
   details: {
      fontSize: "16px",
      fontWeight: 400,
      textAlign: "center",
      lineHeight: "24px",
   },
   contentWrapper: {
      maxWidth: "414px",
   },
   contentWrapperMobile: {
      minWidth: "100%",
   },
   buttonsWrapper: {
      justifyContent: "center",
      gap: 1.5,
      width: "100%",
   },
   cancelBtn: {
      width: "162px",
      color: (theme) => theme.palette.neutral[500],
      borderColor: (theme) => theme.palette.neutral[200],
      backgroundColor: "white",
      "&:hover": {
         backgroundColor: "white",
         borderColor: (theme) => theme.palette.neutral[200],
      },
   },
   removeBtn: {
      width: "162px",
      backgroundColor: (theme) => theme.palette.error[600],
      "&:hover": {
         backgroundColor: (theme) => theme.palette.error[600],
      },
   },
   loadingRemoval: {
      color: (theme) => theme.palette.error[500],
   },
})

type Props = {
   isOpen: boolean
   handleClose: () => void
   job: PublicCustomJob
   onRemove?: () => void
}

const ProfileRemoveCustomJobConfirmation = ({
   isOpen,
   handleClose,
   job,
   onRemove,
}: Props) => {
   const isMobile = useIsMobile()
   const theme = useTheme()

   const { handleConfirmRemove, isRemoving } = useRemoveUserCustomJob(job)

   const handleClick = useCallback(async () => {
      await handleConfirmRemove()
      onRemove && onRemove()
      handleClose()
   }, [onRemove, handleConfirmRemove, handleClose])

   const confirmDetailsText =
      "You’re about to remove this job from your initiated applications. Once removed, it won’t be shown on your profile anymore. Do you wish to continue?"

   return (
      <Dialog
         open={isOpen}
         onClose={handleClose}
         fullScreen={false}
         PaperProps={{
            sx: isMobile ? styles.dialogMobile : null,
         }}
      >
         <DialogContent sx={styles.dialogContent}>
            <Stack alignItems={"center"} spacing={4} m={0}>
               <Stack alignItems={"center"} spacing={2}>
                  {isRemoving ? (
                     <CircularProgress size={48} sx={styles.loadingRemoval} />
                  ) : (
                     <XCircle size={48} color={theme.palette.error[500]} />
                  )}
                  <Stack spacing={1.5}>
                     <Typography
                        variant="brandedH4"
                        sx={styles.header}
                        color={"neutral.900"}
                     >
                        Remove this job?
                     </Typography>
                     <Typography sx={styles.details} color={"neutral.700"}>
                        {confirmDetailsText}
                     </Typography>
                  </Stack>
               </Stack>
               <Stack direction={"row"} sx={styles.buttonsWrapper}>
                  <Button
                     variant="outlined"
                     sx={styles.cancelBtn}
                     onClick={handleClose}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="contained"
                     sx={styles.removeBtn}
                     onClick={handleClick}
                  >
                     Remove job
                  </Button>
               </Stack>
            </Stack>
         </DialogContent>
      </Dialog>
   )
}

export default ProfileRemoveCustomJobConfirmation
