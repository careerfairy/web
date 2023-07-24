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

type Action = {
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
   primaryAction: Action
   secondaryAction: Action
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
      >
         <DialogTitle id="confirmation-dialog-title">
            <Box
               display="flex"
               justifyContent="space-between"
               alignItems="center"
            >
               <Box display="flex" flexDirection="column" alignItems="center">
                  {icon}
                  {title}
               </Box>
               <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
               >
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent>
            <DialogContentText
               id="confirmation-dialog-description"
               sx={{ color: "text.secondary" }}
            >
               {description}
            </DialogContentText>
         </DialogContent>
         <DialogActions>
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
