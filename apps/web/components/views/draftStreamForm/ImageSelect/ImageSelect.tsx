import React, { useEffect, useState } from "react"
import {
   Avatar,
   Box,
   Button,
   CardMedia,
   Collapse,
   FormHelperText,
   Typography,
} from "@mui/material"
import PublishIcon from "@mui/icons-material/Publish"
import { uploadLogo } from "../../../helperFunctions/HelperFunctions"
import FilePickerContainer from "../../../ssr/FilePickerContainer"
import makeStyles from "@mui/styles/makeStyles"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"

const logoPlaceholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Flogo-placeholder.png?alt=media&token=ef6c8d5a-af92-4b69-a946-ce78a9997382"

const useStyles = makeStyles((theme) => ({
   media: {
      display: "flex",
      justifyContent: "center",
      borderRadius: 4,
      height: 200,
      width: "100%",
   },
   avaWrapper: {
      display: "grid",
      placeItems: "center",
      height: 200,
      width: "100%",
   },
   image: {
      objectFit: "contain",
      width: "100%",
      borderRadius: 4,
   },
   inputRoot: {
      paddingRight: 9,
   },
   input: {
      "& .MuiInputBase-input": {
         cursor: "pointer",
      },
      "& .MuiInputBase-root": {
         padding: "9px !important",
      },
   },
   avaLarge: {
      width: theme.spacing(20),
      height: theme.spacing(20),
   },
   avatarRing: {
      borderRadius: "50%",
      border: "2px solid",
      borderColor: theme.palette.primary.main,
      padding: theme.spacing(1),
   },
}))

type Props = {
   error: any
   value: any
   formName: string
   label: string
   isSubmitting: boolean
   getDownloadUrl: (element: any) => string
   setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
   path: string
   isAvatar?: boolean
   resolution?: string
   showIconButton?: boolean
   isButtonOutlined?: boolean
   buttonCentered?: boolean
}

const ImageSelect = ({
   error,
   value,
   formName,
   label,
   isSubmitting,
   getDownloadUrl,
   setFieldValue,
   path,
   isAvatar = false,
   resolution,
   showIconButton = true,
   isButtonOutlined = true,
   buttonCentered = false,
}: Props) => {
   const firebase = useFirebaseService()
   const classes = useStyles()
   const [filePickerError, setFilePickerError] = useState(null)

   useEffect(() => {
      setFilePickerError(error)
   }, [error])

   const renderImage = isAvatar ? (
      <div className={classes.avaWrapper}>
         <Box className={classes.avatarRing} boxShadow={3}>
            <Box
               component={Avatar}
               src={value}
               className={classes.avaLarge}
               alt={formName}
            />
         </Box>
      </div>
   ) : (
      <Box p={2} component={CardMedia} boxShadow={2}>
         <Box mt={1}>
            <Typography variant="h6" textAlign="center">
               {label}
            </Typography>
         </Box>

         <Box className={classes.media} my={2}>
            <img
               src={value.length ? value : logoPlaceholder}
               className={classes.image}
               alt={formName}
            />
         </Box>

         <Box mb={2}>
            <Typography variant="h6" textAlign="center">
               Drop your image here or <a>Upload</a>
            </Typography>
         </Box>

         {resolution && (
            <Box mb={2}>
               <Typography
                  fontSize="10px"
                  textAlign="center"
                  color="text.secondary"
               >
                  <strong style={{ fontWeight: 500 }}>
                     Recommended Resolution:
                  </strong>{" "}
                  {resolution}
               </Typography>
            </Box>
         )}
      </Box>
   )

   return (
      <>
         {renderImage}
         <FilePickerContainer
            extensions={["jpg", "jpeg", "png"]}
            maxSize={10}
            onError={(errMsg) => setFilePickerError(errMsg)}
            onChange={(fileObject) => {
               uploadLogo(
                  path,
                  fileObject,
                  firebase,
                  (newUrl, fullPath) => {
                     setFieldValue(formName, getDownloadUrl(fullPath), true)
                     setFilePickerError(null)
                  },
                  () => {}
               )
            }}
         >
            <Box sx={{ width: "100%", textAlign: buttonCentered && "center" }}>
               <Button
                  startIcon={showIconButton ? <PublishIcon /> : null}
                  disabled={isSubmitting}
                  fullWidth={!buttonCentered}
                  style={{ marginTop: "0.5rem" }}
                  color={error ? "secondary" : "primary"}
                  variant={isButtonOutlined ? "outlined" : "contained"}
                  id="upButton"
               >
                  {value?.length ? `Change ${label}` : `Upload ${label}`}
               </Button>
            </Box>
         </FilePickerContainer>
         <Collapse in={Boolean(filePickerError)}>
            <FormHelperText error>{filePickerError}</FormHelperText>
         </Collapse>
      </>
   )
}

export default ImageSelect
