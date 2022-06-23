import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   Typography,
} from "@mui/material"
import React from "react"

const styles = {
   title: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   body2: {
      fontSize: "1rem",
      mb: 3,
   },
} as const

type Props = {
   onClose: () => void
   title: string
   children: JSX.Element
   showCloseBtn?: boolean
}

const GenericDialog = ({
   onClose,
   title,
   children,
   showCloseBtn = true,
}: Props) => {
   return (
      <Dialog
         maxWidth="md"
         fullWidth
         TransitionComponent={Grow}
         open={true}
         onClose={onClose}
      >
         <DialogTitle>
            <Typography sx={styles.title}>{title}</Typography>
         </DialogTitle>
         <DialogContent dividers>{children}</DialogContent>
         {showCloseBtn && (
            <DialogActions sx={{ justifyContent: "right" }}>
               <Button variant="outlined" onClick={onClose}>
                  Close
               </Button>
            </DialogActions>
         )}
      </Dialog>
   )
}

export default GenericDialog
