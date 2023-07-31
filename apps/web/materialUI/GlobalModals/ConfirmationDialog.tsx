import CloseIcon from "@mui/icons-material/Close"
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton"
import { Stack, Typography } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import { Box } from "@mui/system"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   icon: {},
   closeIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      p: 2.5,
      "& svg": {
         width: 32,
         height: 32,
      },
   },
   titleWrapper: {
      position: "relative",
      pt: 3,
      px: 3,
      pb: 2,
   },
   titleText: {
      textAlign: "center",
      fontSize: "1.71429rem",
      fontWeight: 600,
   },
   description: {
      textAlign: "center",
      color: "text.secondary",
      fontSize: "1.14286rem",
      fontWeight: 400,
   },
   actions: {
      justifyContent: "center",
      "& button": {
         textTransform: "none",
         boxShadow: "none",
      },
      pt: 4,
      pb: 3,
   },
   content: {
      pb: 0,
   },
})

export type ConfirmationDialogAction = {
   text: string
   color?: LoadingButtonProps["color"]
   callback: () => void
   variant?: LoadingButtonProps["variant"]
   loading?: LoadingButtonProps["loading"]
}

type Props = {
   open: boolean
   handleClose: () => void
   title: string
   description: string | ReactNode
   icon: ReactNode
   primaryAction: ConfirmationDialogAction
   secondaryAction: ConfirmationDialogAction
}

const ConfirmationDialog: FC<Props> = ({
   open,
   handleClose,
   title,
   description,
   icon,
   primaryAction: {
      text: primaryActionText,
      color: primaryActionColor,
      callback: primaryActionCallback,
      variant: primaryActionVariant,
      loading: primaryActionLoading,
   },
   secondaryAction: {
      text: secondaryActionText,
      color: secondaryActionColor,
      callback: secondaryActionCallback,
      variant: secondaryActionVariant,
      loading: secondaryActionLoading,
   },
}) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         aria-labelledby="confirmation-dialog-title"
         aria-describedby="confirmation-dialog-description"
         maxWidth="xs"
         fullScreen={isMobile}
      >
         <DialogTitle sx={styles.titleWrapper} id="confirmation-dialog-title">
            <Stack alignItems="center" spacing={2}>
               {icon}
               <Typography sx={styles.titleText} component="h6">
                  {title}
               </Typography>
            </Stack>
            <Box sx={styles.closeIcon}>
               <IconButton
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
               >
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent sx={styles.content}>
            <DialogContentText
               id="confirmation-dialog-description"
               sx={styles.description}
            >
               {description}
            </DialogContentText>
         </DialogContent>
         <DialogActions sx={styles.actions}>
            <LoadingButton
               onClick={() => secondaryActionCallback()}
               color={secondaryActionColor}
               variant={secondaryActionVariant}
               loading={secondaryActionLoading}
            >
               {secondaryActionText}
            </LoadingButton>
            <LoadingButton
               onClick={() => primaryActionCallback()}
               color={primaryActionColor}
               variant={primaryActionVariant}
               loading={primaryActionLoading}
               autoFocus
            >
               {primaryActionText}
            </LoadingButton>
         </DialogActions>
      </Dialog>
   )
}

export default ConfirmationDialog
