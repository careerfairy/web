import { CloseRounded } from "@mui/icons-material"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
   Box,
   Dialog,
   IconButton,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "100%",
      justifyContent: "space-between",
   },
   container: {
      overflowX: "auto",
   },
   header: {
      padding: "16px",
      paddingBottom: {
         xs: 0,
         md: "initial",
      },
      marginBottom: "28px",
   },
   title: {
      color: "neutral.800",
      textAlign: {
         xs: "left",
         md: "center",
      },
      fontSize: {
         xs: "28px",
         md: "32px",
      },
      fontWeight: 600,
      lineHeight: {
         xs: "42px",
         md: "48px",
      },
      letterSpacing: {
         xs: "-0.04343rem",
         md: "-0.04886rem",
      },
   },
   highlightedTitleText: {
      color: "secondary.main",
   },
   subtitle: {
      color: "neutral.600",
      textAlign: {
         xs: "left",
         md: "center",
      },
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "24px",
      mx: {
         md: "auto",
      },
      letterSpacing: {
         xs: "-0.02343rem",
         md: "-0.04886rem",
      },
   },
   fields: {
      paddingX: {
         xs: "16px",
         md: "14%",
      },
      paddingBottom: "24px",
   },
   actions: {
      display: "flex",
      borderTop: "1px solid #F0F0F0",
      alignItems: "center",
      justifyContent: "end",
      gap: "16px",
      padding: {
         xs: "21px",
         md: "24px",
      },
   },
   closeBtn: {
      zIndex: 1,
      position: "absolute",
      top: {
         xs: "12px",
         md: "20px",
      },
      right: {
         xs: "16px",
         md: "20px",
      },
      color: "text.primary",
      "& svg": {
         width: 32,
         height: 32,
         color: "text.primary",
      },
   },
   button: {
      textTransform: "none",
      "&:disabled": {
         bgcolor: "#EDEDED",
         color: "#BBBBBB",
      },
   },
   dialog: {
      maxWidth: "770px",
      height: "84.3%",
      maxHeight: "723px",
   },
   drawer: {
      height: "calc(100% - 22px)",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
   },
})

export const CreatorFormLayout = ({ children, handleClose }) => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.closeBtn}>
            <IconButton onClick={handleClose}>
               <CloseRounded />
            </IconButton>
         </Box>
         {children}
      </Box>
   )
}

const Container = ({ children }) => {
   return <Box sx={styles.container}>{children}</Box>
}

const Header = ({ children }) => {
   return <Box sx={styles.header}>{children}</Box>
}

const Title = ({ children }) => {
   return (
      <Typography component="h1" sx={styles.title}>
         {children}
      </Typography>
   )
}

const HighlightedTitleText = ({ children }) => {
   return (
      <Box component="span" sx={styles.highlightedTitleText}>
         {children}
      </Box>
   )
}

const Subtitle = ({ children }) => {
   return <Typography sx={styles.subtitle}>{children}</Typography>
}

const Fields = ({ children }) => {
   return <Box sx={styles.fields}>{children}</Box>
}

const Actions = ({ children }) => {
   return <Box sx={styles.actions}>{children}</Box>
}

type BrandedDialogProps = {
   isDialogOpen: boolean
   handleCloseDialog: () => void
   isMobile: boolean
   children: React.ReactNode
}

const BrandedDialog = ({
   isDialogOpen,
   handleCloseDialog,
   isMobile,
   children,
}: BrandedDialogProps) => {
   return isMobile ? (
      <SwipeableDrawer
         anchor="bottom"
         open={isDialogOpen}
         onOpen={() => null}
         onClose={handleCloseDialog}
         PaperProps={{
            sx: styles.drawer,
         }}
      >
         {children}
      </SwipeableDrawer>
   ) : (
      <Dialog
         open={isDialogOpen}
         onClose={handleCloseDialog}
         PaperProps={{
            sx: styles.dialog,
         }}
      >
         {children}
      </Dialog>
   )
}

const CustomButton = ({ children, ...props }: LoadingButtonProps) => {
   return (
      <LoadingButton sx={styles.button} color="secondary" {...props}>
         {children}
      </LoadingButton>
   )
}

CreatorFormLayout.Container = Container
CreatorFormLayout.Header = Header
CreatorFormLayout.Title = Title
CreatorFormLayout.HighlightedTitleText = HighlightedTitleText
CreatorFormLayout.Subtitle = Subtitle
CreatorFormLayout.Fields = Fields
CreatorFormLayout.Actions = Actions
CreatorFormLayout.Button = CustomButton
CreatorFormLayout.Dialog = BrandedDialog
