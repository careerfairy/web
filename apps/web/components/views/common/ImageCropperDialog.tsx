import { LoadingButton } from "@mui/lab"
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   Slider,
   Stack,
   SxProps,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"
import "cropperjs/dist/cropper.css"
import { ReactNode, useCallback, useRef, useState } from "react"
import Cropper, { ReactCropperElement, ReactCropperProps } from "react-cropper"
import { Image as ImageIcon, X as XIcon } from "react-feather"
import useSWRMutation from "swr/mutation"
import { combineStyles, sxStyles } from "types/commonTypes"

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
   rectangleCropper: {
      ".cropper-face": {
         borderRadius: "0",
      },
      ".cropper-view-box": {
         borderRadius: "0",
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

export type CropType = "circle" | "rectangle"

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
   swrKey?: string
   cropType?: CropType
   cropBoxResizable?: boolean
   applyButtonSx?: SxProps
   cropperSlideSx?: SxProps
   backButtonText?: string
   titleIcon?: ReactNode
}

const ImageCropperDialog = ({
   title,
   imageSrc,
   open,
   handleClose,
   onSubmit,
   aspectRatio = 1,
   fileName = "croppedImage",
   swrKey,
   cropType = "circle",
   cropBoxResizable = false,
   applyButtonSx,
   cropperSlideSx,
   backButtonText,
   titleIcon,
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
            `${fileName}.png`
         )

         await onSubmit(croppedImageFile)
         handleClose()
      } catch (e) {
         errorNotification(e, e)
      }
   }, [errorNotification, fileName, handleClose, onSubmit])

   const { trigger: mutateImage, isMutating } = useSWRMutation(
      swrKey ? swrKey : `update-group-${title}-logo`,
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

   const handleChange = useCallback(
      (_: Event, newValue: number) => {
         const cropper = cropperRef.current.cropper

         if (newValue > scale) {
            zoomIn(cropper)
         } else if (newValue < scale) {
            zoomOut(cropper)
         } else if (newValue === 1) {
            zoomOut(cropper)
         }

         setScale(newValue as number)
      },
      [scale]
   )

   // Adjust crop box to maximum width on initial render
   const handleReady = () => {
      const cropper = cropperRef.current.cropper
      if (!cropper) return

      const containerData = cropper.getContainerData()
      const aspectRatio = cropper.getImageData().aspectRatio
      const maxWidth = containerData.width
      const maxHeight = containerData.height

      let cropBoxWidth = maxWidth
      let cropBoxHeight = maxWidth / aspectRatio

      if (cropBoxHeight > maxHeight) {
         cropBoxHeight = maxHeight
         cropBoxWidth = maxHeight * aspectRatio
      }

      cropper.setCropBoxData({
         width: cropBoxWidth,
         height: cropBoxHeight,
         left: (containerData.width - cropBoxWidth) / 2,
         top: (containerData.height - cropBoxHeight) / 2,
      })

      cropper.zoomTo(0)
   }

   return (
      <Dialog open={open} fullScreen={fullScreen} onClose={handleClose}>
         <DialogTitle sx={styles.dialogHeader}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
               {titleIcon ? titleIcon : <ImageIcon />}
               <Typography sx={styles.dialogTitle}>
                  {title || "Edit picture"}
               </Typography>
            </Box>
            <span>
               <IconButton onClick={onClose}>
                  <XIcon color="#000000" />
               </IconButton>
            </span>
         </DialogTitle>
         <DialogContent dividers>
            <Box
               sx={
                  cropType === "circle"
                     ? styles.cropper
                     : styles.rectangleCropper
               }
            >
               <Cropper
                  viewMode={1}
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
                  cropBoxResizable={cropBoxResizable}
                  ready={handleReady}
               />
            </Box>
            <Stack
               spacing={2}
               direction="row"
               sx={styles.slider}
               alignItems="center"
               width={"stretch"}
            >
               <ImageIcon width={"24px"} height={"24px"} />
               <Slider
                  color="secondary"
                  max={10}
                  min={1}
                  step={1}
                  aria-label="Scale"
                  onChange={handleChange}
                  sx={cropperSlideSx}
               />
               <ImageIcon width={"36px"} height={"36px"} />
            </Stack>
         </DialogContent>
         <DialogActions sx={styles.button}>
            <Button
               sx={styles.button}
               color="grey"
               variant="outlined"
               onClick={onClose}
            >
               {backButtonText ? backButtonText : "Back"}
            </Button>
            <LoadingButton
               sx={combineStyles(styles.button, applyButtonSx)}
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

const zoomIn = (cropper: Cropper) => cropper.zoom(0.1)

const zoomOut = (cropper: Cropper) => cropper.zoom(-0.1)

export default ImageCropperDialog
