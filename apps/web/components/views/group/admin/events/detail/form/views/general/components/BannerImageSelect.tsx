/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react"
import {
   Box,
   Button,
   Collapse,
   FormHelperText,
   Stack,
   Typography,
} from "@mui/material"
import { UploadIcon } from "./UploadIcon"
import { sxStyles } from "types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { uploadLogo } from "components/helperFunctions/HelperFunctions"
import { useField } from "formik"
import { getDownloadUrl } from "components/helperFunctions/streamFormFunctions"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"

const PLACEHOLDER_BANNER_URL =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Flivestream_creation_banner_placeholder.png?alt=media&token=e12cc34a-44e5-4c00-8ac5-ed6ec232bc69"

const styles = sxStyles({
   root: {
      height: "429px",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #EBEBEF",
      borderRadius: "16px",
   },
   placeholderLogoContainer: {
      height: "111px",
   },
   label: {
      color: "#212020",
      lineHeight: "24px",
      fontSize: {
         xs: "13px",
         sm: "16px",
      },
      textAlign: "center",
   },
   recommendedSize: {
      color: "#9C9C9C",
      lineHeight: "16px",
      fontSize: {
         xs: "10px",
         sm: "12px",
      },
      textAlign: "center",
   },
   uploadButton: {
      backgroundColor: "#FAFAFE",
   },
})

/*
 *
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 * PLEASE IGNORE THIS COMPONENT FOR NOW, STILL NEEDS WORK, WILL TACKLE IT LATER
 *
 */
const BannerImageSelect = () => {
   const isMobile = useIsMobile()
   const firebase = useFirebaseService()
   const [field, meta, helpers] = useField("general.backgroundImageUrl")

   const [filePickerError, setFilePickerError] = useState(null)

   useEffect(() => {
      setFilePickerError(meta.error)
   }, [meta])

   const handleFilePickerChange = useCallback((fileObject) => {
      /*
    uploadLogo(
        "illustration-images",
        fileObject,
        firebase,
        (newUrl, fullPath) => {
          helpers.setValue(getDownloadUrl(fullPath), true)
          setFilePickerError(null)
        },
        () => {}
        )
        */
      setFilePickerError(null)
   }, [])

   const handleFilePickerError = useCallback((errMsg) => {
      console.log("ERROOOOOOR", errMsg)
      setFilePickerError(errMsg)
   }, [])

   return (
      <>
         <Stack spacing="10px" direction="column" sx={styles.root}>
            <Box sx={styles.placeholderLogoContainer}>
               <img src={PLACEHOLDER_BANNER_URL} alt={"Banner Upload Banner"} />
            </Box>
            <Box>
               <Typography sx={styles.label}>
                  Upload your live stream banner image
               </Typography>
               <Typography sx={styles.recommendedSize}>
                  Recommended size: 1920x1080
               </Typography>
            </Box>
            <FilePickerContainer
               extensions={["jpg", "jpeg", "png"]}
               maxSize={10}
               onChange={handleFilePickerChange}
               onError={handleFilePickerError}
            >
               <Button
                  endIcon={<UploadIcon />}
                  size={isMobile ? "small" : "medium"}
                  variant="outlined"
                  color="secondary"
               >
                  <Typography>Upload banner</Typography>
               </Button>
            </FilePickerContainer>
         </Stack>
         <Collapse
            in={Boolean(filePickerError)}
            sx={{ textAlignLast: "center" }}
         >
            <FormHelperText error>{filePickerError}</FormHelperText>
         </Collapse>
      </>
   )
}

export default BannerImageSelect
