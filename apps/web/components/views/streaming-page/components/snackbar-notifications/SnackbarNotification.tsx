import CloseIcon from "@mui/icons-material/Close"
import {
   IconButton,
   Slide,
   SlideProps,
   Snackbar,
   SnackbarContent,
   Stack,
   Typography,
} from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialog: {
      display: "inline-flex",
      padding: 2,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 1.5,
      width: "352px",
      borderRadius: "12px",
      background: "white",
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      color: (theme) => theme.palette.neutral[900],
      "& .MuiSnackbarContent-message": {
         padding: 0,
         width: "100%",
      },
   },
   content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
   },
   header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
   },
   headerText: {
      fontWeight: 600,
   },
   headerIcon: {
      flexDirection: "row",
      alignItems: "center",
      gap: "8px",
      flex: "1 0 0",
   },
})

type SnackbarNotificationProps = {
   open: boolean
   notification: ReactNode
}

export const SnackbarNotification = ({
   open,
   notification,
}: SnackbarNotificationProps) => {
   return (
      <Snackbar open={open} TransitionComponent={SlideTransition}>
         <SnackbarContent
            sx={styles.dialog}
            message={notification ? notification : null}
         />
      </Snackbar>
   )
}

type SnackbarHeaderProps = {
   children: ReactNode
   handleClose: () => void
   icon?: ReactNode
}

const SnackbarHeader = ({
   children,
   handleClose,
   icon,
}: SnackbarHeaderProps) => {
   return (
      <Stack spacing={"20px"} sx={styles.content}>
         <Stack sx={styles.header}>
            <Stack sx={styles.headerIcon}>
               {icon ? icon : null}
               <Typography variant="brandedH5" sx={styles.headerText}>
                  {children}
               </Typography>
               <Stack />
            </Stack>
            <IconButton onClick={handleClose}>
               <CloseIcon />
            </IconButton>
         </Stack>
      </Stack>
   )
}

function SlideTransition(props: SlideProps) {
   return <Slide {...props} direction="up" />
}

SnackbarNotification.Header = SnackbarHeader
