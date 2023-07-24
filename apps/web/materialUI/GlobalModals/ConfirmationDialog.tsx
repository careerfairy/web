import Button, { ButtonProps } from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogActions from "@mui/material/DialogActions"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { Box } from "@mui/system"
import { ReactNode, FC } from "react"
import { sxStyles } from "types/commonTypes"
import { Stack } from "@mui/material"
import { Typography } from "@mui/material"

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
   color?: ButtonProps["color"]
   callback: () => void
   variant?: ButtonProps["variant"]
}

type Props = {
   open: boolean
   handleClose: () => void
   title: string
   description: string
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
   },
   secondaryAction: {
      text: secondaryActionText,
      color: secondaryActionColor,
      callback: secondaryActionCallback,
      variant: secondaryActionVariant,
   },
}) => {
   return (
      <Dialog
         open={open}
         onClose={handleClose}
         aria-labelledby="confirmation-dialog-title"
         aria-describedby="confirmation-dialog-description"
         maxWidth="xs"
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
            <Button
               onClick={secondaryActionCallback}
               color={secondaryActionColor}
               variant={secondaryActionVariant}
            >
               {secondaryActionText}
            </Button>
            <Button
               onClick={primaryActionCallback}
               color={primaryActionColor}
               variant={primaryActionVariant}
               autoFocus
            >
               {primaryActionText}
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ConfirmationDialog
