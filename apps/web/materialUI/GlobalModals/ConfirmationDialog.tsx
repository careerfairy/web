import CloseIcon from "@mui/icons-material/Close"
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton"
import {
   ButtonProps,
   DialogContentText,
   Drawer,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import Dialog, { DialogProps } from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import { Box } from "@mui/system"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const ICON_SIZE = {
   xs: 56,
   tablet: 64,
}

const styles = sxStyles({
   iconWrapper: {
      "& svg": {
         height: {
            xs: ICON_SIZE.xs,
            tablet: ICON_SIZE.tablet,
         },
         width: {
            xs: ICON_SIZE.xs,
            tablet: ICON_SIZE.tablet,
         },
         fontSize: {
            xs: ICON_SIZE.xs,
            tablet: ICON_SIZE.tablet,
         },
      },
   },
   closeIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      p: 2.5,
      "& svg": {
         width: "32px !important",
         height: "32px !important",
      },
   },
   titleWrapper: {
      position: "relative",
      pt: 2.5,
      px: 4,
      pb: 0,
   },
   description: {
      textAlign: "center",
      color: "neutral.700",
      pt: 1.5,
      pb: {
         xs: 4,
         tablet: 3,
      },
   },
   actions: {
      justifyContent: "center",
      "& button": {
         whiteSpace: "nowrap",
      },
      pb: 3,
      pt: 0,
      px: 4,
   },
   actionsStack: {
      pt: 4,
   },
   content: {
      pb: 0,
      px: 4,
   },
   paper: {
      py: 3,
      px: 3.5,
      borderRadius: "12px 12px 0 0",
   },
   defaultMaxWidth: {
      maxWidth: 430,
   },
})

export type ConfirmationDialogAction = {
   text: string
   color?: LoadingButtonProps["color"]
   callback: () => void
   variant?: LoadingButtonProps["variant"]
   loading?: LoadingButtonProps["loading"]
   autoFocus?: boolean
   fullWidth?: boolean
   disabled?: LoadingButtonProps["disabled"]
   sx?: ButtonProps["sx"]
}

type Props = {
   open: boolean
   hideCloseIcon?: boolean
   handleClose?: () => void
   title: string
   description?: string | ReactNode
   additionalContent?: ReactNode
   icon: ReactNode
   primaryAction: ConfirmationDialogAction
   secondaryAction?: ConfirmationDialogAction
   sx?: DialogProps["sx"]
   width?: number
   mobileButtonsHorizontal?: boolean
}

const ConfirmationDialog: FC<Props> = (props) => {
   const {
      open,
      handleClose,
      hideCloseIcon,
      title,
      description,
      additionalContent,
      icon,
      primaryAction,
      secondaryAction,
      width,
      sx,
   } = props

   const isMobile = useIsMobile()

   if (isMobile) {
      return <MobileDrawer {...props} />
   }

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         aria-labelledby="confirmation-dialog-title"
         aria-describedby="confirmation-dialog-description"
         maxWidth={width ? false : "xs"}
         TransitionProps={{ unmountOnExit: true }}
         fullScreen={isMobile}
         PaperProps={{
            sx: [width ? { width } : styles.defaultMaxWidth],
         }}
         sx={sx}
      >
         <DialogTitle
            sx={[styles.titleWrapper, styles.iconWrapper]}
            id="confirmation-dialog-title"
         >
            <Stack
               alignItems="center"
               spacing={{
                  xs: 2,
                  tablet: 3,
               }}
            >
               {icon}
               <Typography
                  fontWeight={700}
                  variant="desktopBrandedH4"
                  component="h4"
                  textAlign="center"
               >
                  {title}
               </Typography>
            </Stack>
            {Boolean(handleClose && !hideCloseIcon) && (
               <CloseIconButton handleClose={handleClose} />
            )}
         </DialogTitle>
         <DialogContent sx={styles.content}>
            {Boolean(description) && (
               <Typography
                  id="confirmation-dialog-description"
                  sx={styles.description}
                  variant="medium"
                  component={DialogContentText}
               >
                  {description}
               </Typography>
            )}
            {additionalContent}
         </DialogContent>
         <DialogActions sx={styles.actions}>
            <Stack direction="row" spacing={1.5} width="100%">
               {Boolean(secondaryAction) && (
                  <ActionButton fullWidth {...secondaryAction} />
               )}
               <ActionButton fullWidth autoFocus {...primaryAction} />
            </Stack>
         </DialogActions>
      </Dialog>
   )
}

const MobileDrawer = ({
   open,
   handleClose,
   hideCloseIcon,
   title,
   description,
   additionalContent,
   icon,
   primaryAction,
   secondaryAction,
   sx,
   mobileButtonsHorizontal,
}: Props) => {
   const isSwipeable = Boolean(handleClose)
   const DrawerComponent = isSwipeable ? SwipeableDrawer : Drawer

   return (
      <DrawerComponent
         onClose={handleClose}
         open={open}
         anchor="bottom"
         PaperProps={{
            sx: styles.paper,
         }}
         {...(isSwipeable && { onOpen: () => {} })}
         sx={sx}
         ModalProps={{
            keepMounted: false, // Fixed Blocked aria-hidden console error
         }}
      >
         <Stack
            alignItems="center"
            spacing={{
               xs: 2,
               tablet: 3,
            }}
            sx={styles.iconWrapper}
         >
            {icon}
            <Typography
               fontWeight={600}
               variant="desktopBrandedH4"
               textAlign="center"
            >
               {title}
            </Typography>
         </Stack>
         {Boolean(handleClose && !hideCloseIcon) && (
            <CloseIconButton handleClose={handleClose} />
         )}
         {Boolean(description) && (
            <Typography
               id="confirmation-dialog-description"
               sx={styles.description}
               variant="medium"
            >
               {description}
            </Typography>
         )}
         {additionalContent}
         <Stack
            direction={
               mobileButtonsHorizontal
                  ? "row"
                  : {
                       xs: "column-reverse",
                       sm: "row",
                    }
            }
            spacing={1.5}
            justifyContent="center"
            width="100%"
         >
            {Boolean(secondaryAction) && <ActionButton {...secondaryAction} />}
            <ActionButton autoFocus {...primaryAction} />
         </Stack>
      </DrawerComponent>
   )
}

type CloseIconButtonProps = {
   handleClose: () => void
}

const CloseIconButton = ({ handleClose }: CloseIconButtonProps) => (
   <Box sx={styles.closeIcon}>
      <IconButton color="inherit" onClick={handleClose} aria-label="close">
         <CloseIcon />
      </IconButton>
   </Box>
)

const ActionButton = ({
   text,
   callback,
   ...props
}: ConfirmationDialogAction) => {
   return (
      <LoadingButton {...props} onClick={callback}>
         {text}
      </LoadingButton>
   )
}

export default ConfirmationDialog
