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
   onClose: () => void
   title: string
   children: JSX.Element
   showCloseBtn?: boolean
   titleOnCenter?: boolean
}

const GenericDialog = ({
   onClose,
   title,
   titleOnCenter = false,
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
         <DialogTitle sx={titleOnCenter && { alignSelf: "center" }}>
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
