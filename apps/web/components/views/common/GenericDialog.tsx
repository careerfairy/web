import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogProps,
   DialogTitle,
   Grow,
   Typography,
} from "@mui/material"
import { StylesProps, sxStyles } from "../../../types/commonTypes"

const styles: StylesProps = sxStyles({
   title: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   body2: {
      fontSize: "1rem",
      mb: 3,
   },
})

type Props = {
   onClose?: () => void
   title: string
   children: JSX.Element
   maxWidth?: DialogProps["maxWidth"]
   showCloseBtn?: boolean
   titleOnCenter?: boolean
   additionalLeftButton?: JSX.Element
   additionalRightButton?: JSX.Element
   closeBtnText?: string
}

const GenericDialog = ({
   onClose,
   title,
   titleOnCenter = false,
   children,
   showCloseBtn = true,
   additionalLeftButton,
   maxWidth = "md",
   additionalRightButton,
   closeBtnText = "Close",
}: Props) => {
   const footerButtons =
      showCloseBtn || !!additionalLeftButton || !!additionalRightButton

   return (
      <Dialog
         maxWidth={maxWidth}
         fullWidth
         TransitionComponent={Grow}
         open={true}
         onClose={onClose}
      >
         <DialogTitle sx={titleOnCenter && { alignSelf: "center" }}>
            <Typography sx={styles.title}>{title}</Typography>
         </DialogTitle>
         <DialogContent dividers>{children}</DialogContent>
         {footerButtons && (
            <DialogActions sx={{ justifyContent: "right" }}>
               {additionalLeftButton}
               {showCloseBtn && (
                  <Button variant="outlined" onClick={onClose}>
                     {closeBtnText}
                  </Button>
               )}
               {additionalRightButton}
            </DialogActions>
         )}
      </Dialog>
   )
}

export default GenericDialog
