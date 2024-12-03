import { LoadingButton } from "@mui/lab"
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   Divider,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ReactNode } from "react"
import { X } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   titleWrapper: {
      justifyContent: "space-between",
   },
   closeIcon: {
      width: "32px",
      height: "32px",
      "&:hover": {
         cursor: "pointer",
      },
   },
   actions: {
      py: "24px",
   },
   cancelBtn: {
      borderRadius: "20px",
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      "&:hover": {
         borderColor: (theme) => theme.palette.neutral[50],
         backgroundColor: (theme) => theme.brand.black[400],
      },
   },
})

type Props = {
   title: string
   open: boolean
   children: ReactNode
   handleClose: () => void
   handleSave: () => void
   saveDisabled?: boolean
   isSubmitting?: boolean
   saveText?: string
}

export const BaseProfileDialog = (props: Props) => {
   const {
      title,
      open,
      children,
      handleClose,
      handleSave,
      saveDisabled = true,
      saveText = "Add",
      isSubmitting,
   } = props

   const isMobile = useIsMobile()

   return (
      <Dialog
         open={open}
         fullScreen={isMobile}
         closeAfterTransition={false}
         slotProps={{
            backdrop: {
               onClick: handleClose,
            },
         }}
      >
         <DialogContent>
            <Stack spacing={"24px"}>
               <Stack direction={"row"} sx={styles.titleWrapper}>
                  <Typography variant="brandedH3" sx={styles.title}>
                     {title}
                  </Typography>
                  <Box
                     component={X}
                     sx={styles.closeIcon}
                     onClick={handleClose}
                  />
               </Stack>
               {children}
            </Stack>
         </DialogContent>
         <Divider />
         <DialogActions sx={styles.actions}>
            <Stack direction={"row"} spacing={2}>
               <Button
                  variant="outlined"
                  sx={styles.cancelBtn}
                  onClick={handleClose}
               >
                  <Typography variant="medium" color={"neutral.500"}>
                     Cancel
                  </Typography>
               </Button>
               <LoadingButton
                  variant="contained"
                  color="primary"
                  disabled={saveDisabled}
                  onClick={handleSave}
                  loading={isSubmitting}
               >
                  {saveText}
               </LoadingButton>
            </Stack>
         </DialogActions>
      </Dialog>
   )
}
