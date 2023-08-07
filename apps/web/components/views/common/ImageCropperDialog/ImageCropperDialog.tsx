import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Slider,
   Stack,
   Typography,
} from "@mui/material"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import React, { useEffect, useRef, useState } from "react"
import "cropperjs/dist/cropper.css"
import Cropper, { ReactCropperElement } from "react-cropper"
import { Image, X } from "react-feather"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { sxStyles } from "types/commonTypes"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"

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
   const [scale, setScale] = useState(50)
   const cropperRef = useRef<ReactCropperElement>(null)
   const dispatch = useDispatch()

   const styles = sxStyles({
      dialogHeader: {
         display: "flex",
         justifyContent: "space-between",
         color: "#000000",
         height: "64px",
         alignItems: "stretch",
      },
      button: {
         display: "flex",
         padding: "13px 38px",
         justifyContent: "center",
         alignItems: "center",
         gap: "10px",
         borderRadius: "52px",
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
         },
      },
   })

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
         return uploadTask.snapshot.ref.getDownloadURL()
      } catch (e) {
         console.log("error in async", e)
      }
   }

   const handleChange = (_: Event, newValue: number | number[]) => {
      setScale(newValue as number)
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
            <Box>
               <Cropper
                  viewMode={3}
                  dragMode={"none"}
                  src={imageSrc}
                  aspectRatio={242 / 242}
                  // Cropper.js options
                  guides={false}
                  center={true}
                  ref={cropperRef}
                  movable={true}
                  width={"569px"}
                  height={"317px"}
               />
            </Box>
            <Stack
               spacing={2}
               direction="row"
               sx={{ mb: 1, mr: "auto", ml: "auto", color: "#686868" }}
               alignItems="center"
               width={"347px"}
            >
               <Image width={"24px"} height={"24px"} />
               <Slider
                  sx={{ color: "#6749EA" }}
                  min={10}
                  max={110}
                  step={5}
                  defaultValue={50}
                  value={scale}
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
               className={"primary"}
               onClick={handleSubmit}
            >
               Apply
            </Button>
         </DialogActions>
      </Dialog>
   )
}
