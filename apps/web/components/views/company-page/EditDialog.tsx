import {
   AppBar,
   Dialog,
   DialogContent,
   DialogTitle,
   Slide,
   Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import React from "react"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   header: {
      backgroundColor: "white",
      boxShadow: "none",
      borderBottom: "1px solid #EDE7FD",
   },
   dialogClose: {
      position: "absolute",
      top: "11px",
      right: "5px",
      color: "black",
   },
   content: {},
})

type Props = {
   open: boolean
   title: string
   handleClose: () => void
   children: JSX.Element
}

const EditDialog = ({ open, title, handleClose, children }: Props) => {
   return (
      <Dialog
         TransitionComponent={Slide}
         onClose={handleClose}
         open={open}
         maxWidth={"lg"}
         fullWidth
      >
         <AppBar sx={styles.header} position="sticky">
            <DialogTitle color="black">
               <Typography variant={"h3"} fontWeight={"600"}>
                  {title}
               </Typography>
            </DialogTitle>
            <IconButton onClick={handleClose} sx={styles.dialogClose}>
               <CloseIcon fontSize="large" />
            </IconButton>
         </AppBar>
         <DialogContent sx={styles.content}>{children}</DialogContent>
      </Dialog>
   )
}

export default EditDialog
