import CloseIcon from "@mui/icons-material/Close"
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton"
import { Stack, SwipeableDrawer, Typography } from "@mui/material"
import Dialog from "@mui/material/Dialog"
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
         width: 32,
         height: 32,
      },
   },
   titleWrapper: {
      position: "relative",
      pt: 2.5,
      px: 4,
      pb: 0,
   },
   title: {
      fontWeight: 700,
   },
   mobileTitle: {
      fontWeight: 600,
   },
   description: {
      textAlign: "center",
      color: {
         xs: "neutral.700",
         tablet: "neutral.800",
      },
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
   dialogPaper: {
      maxWidth: 430,
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
   handleClose?: () => void
   title: string
   description: string | ReactNode
   icon: ReactNode
   primaryAction: ConfirmationDialogAction
   secondaryAction: ConfirmationDialogAction
}

const ConfirmationDialog: FC<Props> = (props) => {
   const {
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
         maxWidth="xs"
         fullScreen={isMobile}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
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
                  sx={styles.title}
                  variant="desktopBrandedH4"
                  component="h4"
               >
                  {title}
               </Typography>
            </Stack>
            {Boolean(handleClose) && (
               <Box sx={styles.closeIcon}>
                  <IconButton
                     color="inherit"
                     onClick={handleClose}
                     aria-label="close"
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>
            )}
         </DialogTitle>
         <DialogContent sx={styles.content}>
            <Typography
               id="confirmation-dialog-description"
               sx={styles.description}
            >
               {description}
            </Typography>
         </DialogContent>
         <DialogActions sx={styles.actions}>
            <Stack direction="row" spacing={1.5} width="100%">
               <LoadingButton
                  onClick={() => secondaryActionCallback()}
                  color={secondaryActionColor}
                  variant={secondaryActionVariant}
                  loading={secondaryActionLoading}
                  fullWidth
               >
                  {secondaryActionText}
               </LoadingButton>
               <LoadingButton
                  onClick={() => primaryActionCallback()}
                  color={primaryActionColor}
                  variant={primaryActionVariant}
                  loading={primaryActionLoading}
                  autoFocus
                  fullWidth
               >
                  {primaryActionText}
               </LoadingButton>
            </Stack>
         </DialogActions>
      </Dialog>
   )
}

const MobileDrawer = ({
   open,
   handleClose,
   title,
   description,
   icon,
   primaryAction,
   secondaryAction,
}: Props) => {
   return (
      <SwipeableDrawer
         onOpen={() => {}}
         onClose={handleClose}
         open={open}
         anchor="bottom"
         PaperProps={{
            sx: styles.paper,
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
            <Typography sx={styles.mobileTitle} variant="desktopBrandedH4">
               {title}
            </Typography>
         </Stack>
         {Boolean(handleClose) && (
            <Box sx={styles.closeIcon}>
               <IconButton
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
               >
                  <CloseIcon />
               </IconButton>
            </Box>
         )}
         <Typography
            id="confirmation-dialog-description"
            sx={styles.description}
            variant="medium"
            color="neutral.700"
         >
            {description}
         </Typography>
         <Stack
            direction={{
               xs: "column-reverse",
               sm: "row",
            }}
            spacing={1.5}
            justifyContent="center"
         >
            <LoadingButton
               onClick={() => secondaryAction.callback()}
               color={secondaryAction.color}
               variant={secondaryAction.variant}
               loading={secondaryAction.loading}
            >
               {secondaryAction.text}
            </LoadingButton>
            <LoadingButton
               onClick={() => primaryAction.callback()}
               color={primaryAction.color}
               variant={primaryAction.variant}
               loading={primaryAction.loading}
               autoFocus
            >
               {primaryAction.text}
            </LoadingButton>
         </Stack>
      </SwipeableDrawer>
   )
}

export default ConfirmationDialog
