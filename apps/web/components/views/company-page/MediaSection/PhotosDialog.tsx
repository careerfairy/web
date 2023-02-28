import {
   AppBar,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Slide,
   Typography,
} from "@mui/material"
import React, { ComponentProps } from "react"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { sxStyles } from "../../../../types/commonTypes"
import PhotosGallery from "./PhotosGallery"

type Props = {
   open: boolean
   handleClose: () => void
} & ComponentProps<typeof PhotosGallery>

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
})
const PhotosDialog = ({
   handleClose,
   open,
   photos,
   editable,
   onPhotosChanged,
}: Props) => {
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
                  Photos
               </Typography>
            </DialogTitle>
            <IconButton onClick={handleClose} sx={styles.dialogClose}>
               <CloseIcon fontSize="large" />
            </IconButton>
         </AppBar>
         <DialogContent>
            <PhotosGallery
               onPhotosChanged={onPhotosChanged}
               editable={editable}
               photos={photos}
            />
         </DialogContent>
         <DialogActions>
            <DialogActions>
               <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleClose}
               >
                  Close
               </Button>
            </DialogActions>
         </DialogActions>
      </Dialog>
   )
}

export default PhotosDialog
