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
import useIsMobile from "components/custom-hook/useIsMobile"
import { ReactNode } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import BrandedSwipeableDrawer from "./inputs/BrandedSwipeableDrawer"

const styles = sxStyles({
   header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: { xs: 1.5, md: "16px 24px" },
   },
   closeButton: {
      flexShrink: 0,
      p: 0,
      "& svg": {
         width: "24px",
         height: "24px",
      },
   },
   dialogContent: {
      p: 0,
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
      maxHeight: "95%",
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
   handleClose,
}: ResponsiveDialogProps) => {
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
            onClose={handleClose}
            disableEnforceFocus
         >
            {children}
         </BrandedSwipeableDrawer>
      )
   }
   return (
      <Dialog
         open={open}
         maxWidth={"md"}
         onClose={handleClose}
         fullWidth
         disableEnforceFocus
      >
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
      <>
         {children}
         <IconButton
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={styles.closeButton}
         >
            <CloseIcon />
         </IconButton>
      </>
   )

   if (isMobile) {
      return <Box sx={combineStyles(styles.header, sx)}>{header}</Box>
   }
   return (
      <DialogTitle sx={combineStyles(styles.header, sx)}>{header}</DialogTitle>
   )
}

const Actions = ({ children }: Pick<ResponsiveDialogProps, "children">) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return <Box sx={styles.dialogActions}>{children}</Box>
   }

   return <DialogActions sx={styles.dialogActions}>{children}</DialogActions>
}

const Content = ({ children }: Pick<ResponsiveDialogProps, "children">) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return <Box sx={styles.dialogContent}>{children}</Box>
   }
   return <DialogContent sx={styles.dialogContent}>{children}</DialogContent>
}

ResponsiveDialogLayout.Header = Header
ResponsiveDialogLayout.Actions = Actions
ResponsiveDialogLayout.Content = Content
