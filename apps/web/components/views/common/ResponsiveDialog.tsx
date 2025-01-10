import CloseIcon from "@mui/icons-material/Close"
import {
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   SxProps,
} from "@mui/material"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ReactNode } from "react"
import { Loader } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import BrandedSwipeableDrawer from "./inputs/BrandedSwipeableDrawer"

const styles = sxStyles({
   header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: 1.5,
   },
   closeButton: {
      flexShrink: 0,
      p: 0,
      "& svg": {
         width: "24px",
         height: "24px",
      },
   },
   dialogActions: (theme) => ({
      display: "flex",
      position: "sticky",
      bottom: 0,
      padding: 2,
      justifyContent: "flex-end",
      alignItems: "center",
      borderTop: `1px solid ${theme.brand.black[300]}`,
      background: theme.brand.white[200],
   }),
   drawer: {
      maxHeight: "90%",
   },
})

type ResponsiveDialogProps = {
   handleClose?: () => unknown
   open: boolean
   children: ReactNode
}

/**
 * A responsive dialog component that renders as a modal on desktop and a bottom drawer on mobile.
 */
export const ResponsiveDialogLayout = ({
   children,
   open,
}: Pick<ResponsiveDialogProps, "children" | "open">) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return (
         <BrandedSwipeableDrawer
            open={open}
            anchor="bottom"
            PaperProps={{
               sx: styles.drawer,
            }}
            onOpen={() => {}}
            onClose={() => {}}
            disableEnforceFocus
         >
            {children}
         </BrandedSwipeableDrawer>
      )
   }
   return (
      <Dialog open={open} maxWidth={"md"} fullWidth disableEnforceFocus>
         {children}
      </Dialog>
   )
}

type HeaderProps = {
   sx?: SxProps
}

const Header = ({
   handleClose,
   children,
   sx,
}: HeaderProps & Pick<ResponsiveDialogProps, "children" | "handleClose">) => {
   const isMobile = useIsMobile()

   const header = (
      <Box sx={combineStyles(styles.header, sx)}>
         {children}
         <IconButton
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={styles.closeButton}
         >
            <CloseIcon />
         </IconButton>
      </Box>
   )

   if (!isMobile) {
      return <DialogTitle>{header}</DialogTitle>
   }
   return header
}

const Actions = ({ children }: Pick<ResponsiveDialogProps, "children">) => {
   const isMobile = useIsMobile()

   return (
      <SuspenseWithBoundary>
         {isMobile ? (
            <Box sx={styles.dialogActions}>{children}</Box>
         ) : (
            <DialogActions sx={styles.dialogActions}>{children}</DialogActions>
         )}
      </SuspenseWithBoundary>
   )
}

const Content = ({ children }: Pick<ResponsiveDialogProps, "children">) => {
   const isMobile = useIsMobile()

   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         {isMobile ? (
            <Box>{children}</Box>
         ) : (
            <DialogContent>{children}</DialogContent>
         )}
      </SuspenseWithBoundary>
   )
}

ResponsiveDialogLayout.Header = Header
ResponsiveDialogLayout.Actions = Actions
ResponsiveDialogLayout.Content = Content
