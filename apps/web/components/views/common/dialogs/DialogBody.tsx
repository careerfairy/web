import { ReactNode } from "react"
import {
   Stack,
   Typography,
   DialogTitle,
   DialogContent,
   DialogContentText,
   DialogActions,
   IconButton,
   Box,
   IconButtonProps,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { sxStyles } from "types/commonTypes"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"

const styles = sxStyles({
   icon: {},
   closeIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      p: {
         xs: 0.5,
         sm: 2.5,
      },
      "& svg": {
         width: 32,
         height: 32,
      },
   },
   header: {
      fontWeight: 700,
      textAlign: "center",
      mb: 5,
      fontSize: "2.2857142857rem",
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

type Props = {
   handleClose: () => void
   title?: string
   content?: ReactNode
   icon?: ReactNode
   actions: ReactNode
}

const DialogBody = ({ handleClose, title, content, icon, actions }: Props) => {
   return (
      <>
         <CloseIconButton onClick={handleClose} />
         <DialogTitle sx={styles.titleWrapper} id="dialog-title">
            <Stack alignItems="center" spacing={2}>
               {icon}
               {title ? (
                  <Typography sx={styles.titleText} component="h6">
                     {title}
                  </Typography>
               ) : null}
            </Stack>
         </DialogTitle>
         {content ? (
            <DialogContent sx={styles.content}>
               <DialogContentText
                  id="dialog-description"
                  sx={styles.description}
               >
                  {content}
               </DialogContentText>
            </DialogContent>
         ) : null}
         {actions ? (
            <DialogActions sx={styles.actions}>{actions}</DialogActions>
         ) : null}
      </>
   )
}

type ActionButtonProps123 = LoadingButtonProps & {
   type: "contained" | "outlined" | "rectangular"
}

const ActionButton = (props: ActionButtonProps123) => (
   <LoadingButton {...props} />
)

const CloseIconButton = ({ onClick }: Pick<IconButtonProps, "onClick">) => (
   <Box sx={styles.closeIcon}>
      <IconButton color="inherit" onClick={onClick} aria-label="close">
         <CloseIcon />
      </IconButton>
   </Box>
)

DialogBody.ActionButton = ActionButton
DialogBody.CloseIconButton = CloseIconButton

export default DialogBody
