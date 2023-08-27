import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Slider,
   Stack,
   Typography,
} from "@mui/material"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import React, { useRef, useState } from "react"
import "cropperjs/dist/cropper.css"
import Cropper, { ReactCropperElement } from "react-cropper"
import { Image, X } from "react-feather"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { sxStyles } from "types/commonTypes"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"

const styles = sxStyles({
   circleOutline: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      border: "2px solid blue",
   },
   cropper: {
      ".cropper-center": {
         width: "100%",
         height: "100%",
         marginX: "-50%",
         marginY: "-50%",
         borderRadius: "50% 50%",
         border: "0px solid white",
         opacity: 1,
      },
      ".cropper-face": {
         borderRadius: "50% 50%",
      },
      ".cropper-move": {
         borderRadius: "50% 50%",
      },
      ".cropper-view-box": {
         borderRadius: "50% 50%",
      },
      img: {
         display: "block",
         maxWidth: "100%",
      },
   },
   dialogHeader: {
      display: "flex",
      justifyContent: "space-between",
      color: "#000000",
      height: "64px",
      alignItems: "stretch",
      width: "stretch",
   },
   button: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      borderRadius: "52px",
      textTransform: "none",
      justifyContent: "flex-end",
      "@media (max-width: 768px)": {
         justifyContent: "center",
      },
      ".secondary": {
         color: "#888",
         fontFamily: "Poppins",
         fontSize: "18px",
         fontStyle: "normal",
         fontWeight: 400,
         lineHeight: "16px",
         border: "1px solid #EDEDED",
      },
      ".primary": {
         color: "#FFF",
         fontSize: "18px",
         fontStyle: "normal",
         fontWeight: 400,
         lineHeight: "16px",
         background: "#6749EA",
         ":hover": {
            background: "#6749EA",
            color: "#FFF",
         },
      },
   },
})

type Props = {
   title?: string
   imageSrc: string
   fileName: string
   open: boolean
   handleClose: (resultUrl?: string) => {}
}

export const ImageCropperDialog = ({
   title,
   imageSrc,
   open,
   handleClose,
}: Props) => {
   const firebase = useFirebaseService()
   const [scale, setScale] = useState(0)
   const cropperRef = useRef<ReactCropperElement>(null)
   const dispatch = useDispatch()

   const uploadLogo = async (fileObjectString: string) => {
      try {
         // Converting cropped 64 based encoded string to a File
         const newFileObject = dataURLtoFile(fileObjectString)
         // Getting the storage instance
         const storageRef = firebase.getStorageRef()
         // Setting up the storage file path
         const fullPath = "group-logos" + "/" + newFileObject.name
         const companyLogoRef = storageRef.child(fullPath)
         const uploadTask = companyLogoRef.put(newFileObject)
         await uploadTask.then()
         const url = await uploadTask.snapshot.ref.getDownloadURL()
         return url
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      try {
         const cropper = cropperRef.current?.cropper
         const resultUrl = await uploadLogo(
            cropper.getCroppedCanvas().toDataURL()
         )
         return handleClose(resultUrl)
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
   }

   const zoomIn = (cropper: Cropper) => cropper.zoom(0.1)

   const zoomOut = (cropper: Cropper) => cropper.zoom(-0.1)

   const handleChange = (_: Event, newValue: number) => {
      const cropper = cropperRef.current.cropper

      if (newValue > scale) {
         zoomIn(cropper)
      } else if (newValue < scale) {
         zoomOut(cropper)
      } else if (newValue === 1) {
         zoomOut(cropper)
      }

      setScale(newValue as number)
   }

   return (
      <Dialog open={open} onClose={handleClose}>
         <DialogTitle sx={styles.dialogHeader}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
               <Image />
               <Typography
                  sx={{
                     ml: "10px",
                     fontSize: "16px",
                     fontWeight: 400,
                     letterSpacing: "-0.176px",
                     width: "stretch",
                  }}
               >
                  {Boolean(title) ? title : "Edit picture"}
               </Typography>
            </Box>
            <Button onClick={() => handleClose()}>
               <X color="#000000" />
            </Button>
         </DialogTitle>
         <DialogContent>
            <Box sx={styles.cropper}>
               <Cropper
                  viewMode={1}
                  dragMode={"none"}
                  src={imageSrc}
                  aspectRatio={1}
                  guides={false}
                  center={true}
                  ref={cropperRef}
                  width={"stretch"}
                  zoomable={true}
                  responsive={true}
                  movable={false}
                  cropBoxResizable={false}
               />
            </Box>
            <Stack
               spacing={2}
               direction="row"
               sx={{ mb: 1, mr: "auto", ml: "auto", color: "#686868" }}
               alignItems="center"
               width={"stretch"}
            >
               <Image width={"24px"} height={"24px"} />
               <Slider
                  sx={{ color: "#6749EA" }}
                  min={1}
                  max={10}
                  step={1}
                  aria-label="Scale"
                  onChange={handleChange}
               />
               <Image width={"36px"} height={"36px"} />
            </Stack>
         </DialogContent>
         <DialogActions sx={styles.button}>
            <Button
               sx={styles.button}
               className="secondary"
               onClick={() => handleClose()}
            >
               Back
            </Button>
            <Button
               sx={styles.button}
               className="primary"
               onClick={handleSubmit}
            >
               Apply
            </Button>
         </DialogActions>
      </Dialog>
   )
}
