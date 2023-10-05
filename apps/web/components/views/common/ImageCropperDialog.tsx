import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   Typography,
} from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"
import "cropperjs/dist/cropper.css"
import React, { useCallback, useRef, useState } from "react"
import Cropper, { ReactCropperElement, ReactCropperProps } from "react-cropper"
import { Image as ImageIcon, X as XIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"
import useSWRMutation from "swr/mutation"
import { LoadingButton } from "@mui/lab"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   dialogTitle: {
      ml: 1.25,
      fontSize: "1.14286rem",
      fontWeight: 400,
      letterSpacing: "-0.176px",
   },
   slider: {
      mb: 1,
      color: "#686868",
   },
   cropper: {
      ".cropper-face": {
         borderRadius: "50% 50%",
      },
      ".cropper-view-box": {
         borderRadius: "50% 50%",
      },
      "& img": {
         display: "block",
         maxWidth: "100%",
      },
   },
   dialogHeader: {
      display: "flex",
      justifyContent: "space-between",
      color: "#000000",
      pt: 2,
      pb: 1.75,
      px: 2.5,
   },
   button: {
      fontSize: "1.143rem",
      px: 3,
      py: 1,
      textTransform: "none",
      lineHeight: "168.75%",
   },
})

type Props = {
   title?: string
   imageSrc: string
   fileName: string
   open: boolean
   handleClose: () => void
   /**
    * @param {File} CroppedImageFile - The cropped image file
    */
   onSubmit: (CroppedImageFile: File) => Promise<void>
   aspectRatio?: ReactCropperProps["aspectRatio"]
}

const ImageCropperDialog = ({
   title,
   imageSrc,
   open,
   handleClose,
   onSubmit,
   aspectRatio = 1,
}: Props) => {
   const { errorNotification } = useSnackbarNotifications()
   const fullScreen = useIsMobile()

   const [scale, setScale] = useState(0)
   const cropperRef = useRef<ReactCropperElement>(null)

   const handleSubmit = useCallback(async () => {
      try {
         const cropper = cropperRef.current?.cropper
         if (!cropper) return
         const croppedImageUrl = cropper.getCroppedCanvas().toDataURL()
         const croppedImageFile = dataURLtoFile(
            croppedImageUrl,
            "croppedImage.png"
         )

         await onSubmit(croppedImageFile)
         handleClose()
      } catch (e) {
         errorNotification(e, e)
      }
   }, [errorNotification, handleClose, onSubmit])

   const { trigger: mutateImage, isMutating } = useSWRMutation(
      `update-group-${title}-logo`,
      handleSubmit,
      {
         onError: (error) => {
            errorNotification(error.message)
         },
         onSuccess: () => {
            handleClose()
         },
      }
   )

   const onClose = () => {
      handleClose()
   }

   return (
      <Dialog open={open} fullScreen={fullScreen} onClose={handleClose}>
         <DialogTitle sx={styles.dialogHeader}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
               <ImageIcon />
               <Typography sx={styles.dialogTitle}>
                  {Boolean(title) ? title : "Edit picture"}
               </Typography>
            </Box>
            <span>
               <IconButton onClick={onClose}>
                  <XIcon color="#000000" />
               </IconButton>
            </span>
         </DialogTitle>
         <DialogContent dividers>
            <Box sx={styles.cropper}>
               <Cropper
                  viewMode={0}
                  dragMode={"none"}
                  src={imageSrc}
                  aspectRatio={aspectRatio}
                  guides={false}
                  center
                  ref={cropperRef}
                  width={"stretch"}
                  zoomable
                  responsive
                  movable={false}
                  minContainerWidth={300}
                  minContainerHeight={300}
                  cropBoxResizable={false}
               />
            </Box>
         </DialogContent>
         <DialogActions sx={styles.button}>
            <Button
               sx={styles.button}
               color="grey"
               variant="outlined"
               onClick={onClose}
            >
               Back
            </Button>
            <LoadingButton
               sx={styles.button}
               onClick={mutateImage}
               loading={isMutating}
               variant="contained"
               color="secondary"
            >
               {isMutating ? "Uploading..." : "Apply"}
            </LoadingButton>
         </DialogActions>
      </Dialog>
   )
}

export default ImageCropperDialog
