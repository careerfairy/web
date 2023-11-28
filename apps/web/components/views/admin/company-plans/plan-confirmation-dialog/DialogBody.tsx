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
import {
   PlanConfirmationDialogKeys,
   usePlanConfirmationDialog,
   usePlanConfirmationDialogStepper,
} from "./CompanyPlanConfirmationDialog"

const styles = sxStyles({
   icon: {
      display: "flex",
      "& svg": {
         color: "primary.600",
         width: 64,
         height: 64,
         fontSize: 64,
      },
   },
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
      pt: 3.5,
      px: 3.5,
      pb: 2.75,
   },
   titleText: {
      textAlign: "center",
      fontSize: "1.71429rem",
      fontWeight: 700,
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
      pb: 3.5,
   },
   content: {
      pb: 0,
   },
   containedBtn: {},
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
         <DialogTitle sx={styles.titleWrapper} id="dialog-title">
            <CloseIconButton onClick={handleClose} />
            <Stack alignItems="center" spacing={0.75}>
               <Box sx={styles.icon}>{icon}</Box>
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

type ActionButtonProps = LoadingButtonProps & {
   buttonType: "primary" | "secondary"
}

const ActionButton = ({ buttonType, ...props }: ActionButtonProps) => (
   <LoadingButton
      variant={buttonType === "primary" ? "contained" : "outlined"}
      color={buttonType === "primary" ? "primary" : "grey"}
      {...props}
   />
)

const CloseIconButton = ({ onClick }: Pick<IconButtonProps, "onClick">) => (
   <Box sx={styles.closeIcon}>
      <IconButton color="inherit" onClick={onClick} aria-label="close">
         <CloseIcon />
      </IconButton>
   </Box>
)

const SecondaryButton = () => {
   const { handleClose, isMutating, groupToManage } =
      usePlanConfirmationDialog()
   const { goToStep } = usePlanConfirmationDialogStepper()

   if (groupToManage.hasPlan()) {
      return (
         <DialogBody.ActionButton
            onClick={handleClose}
            buttonType="secondary"
            loading={isMutating}
         >
            Cancel
         </DialogBody.ActionButton>
      )
   }

   return (
      <DialogBody.ActionButton
         onClick={() => goToStep(PlanConfirmationDialogKeys.SelectPlan)}
         buttonType="secondary"
      >
         Back
      </DialogBody.ActionButton>
   )
}

DialogBody.ActionButton = ActionButton
DialogBody.CloseIconButton = CloseIconButton
DialogBody.SecondaryButton = SecondaryButton

export default DialogBody
