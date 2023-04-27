import React, { useCallback, useEffect, useState } from "react"
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
import { useTheme } from "@mui/material/styles"

const logoPlaceholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Fplaceholder_logo.png?alt=media&token=ef6c8d5a-af92-4b69-a946-ce78a9997382"

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
      width: theme.spacing(18),
      height: theme.spacing(18),
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
   changeImageButtonLabel?: string
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
   changeImageButtonLabel = "",
}: Props) => {
   const firebase = useFirebaseService()
   const classes = useStyles()
   const [filePickerError, setFilePickerError] = useState(null)
   const theme = useTheme()

   useEffect(() => {
      setFilePickerError(error)
   }, [error])

   const handleFilePickerChange = useCallback(
      (fileObject) => {
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
      },
      [firebase, formName, getDownloadUrl, path, setFieldValue]
   )

   const handleFilePickerError = useCallback(
      (errMsg) => setFilePickerError(errMsg),
      []
   )

   const renderFilePicker = (content: JSX.Element): JSX.Element => {
      return (
         <FilePickerContainer
            extensions={["jpg", "jpeg", "png"]}
            maxSize={10}
            onError={handleFilePickerError}
            onChange={handleFilePickerChange}
         >
            {content}
         </FilePickerContainer>
      )
   }

   const renderAvatar = (): JSX.Element => (
      <>
         <div className={classes.avaWrapper}>
            <Box
               className={classes.avatarRing}
               sx={{
                  borderColor: error
                     ? `${theme.palette.error.main} !important`
                     : "",
               }}
               boxShadow={3}
            >
               <Box
                  component={Avatar}
                  src={value}
                  className={classes.avaLarge}
                  alt={formName}
               />
            </Box>
         </div>
         {renderFilePicker(
            <Box sx={{ width: "100%", textAlign: buttonCentered && "center" }}>
               <Button
                  startIcon={showIconButton ? <PublishIcon /> : null}
                  disabled={isSubmitting}
                  fullWidth={!buttonCentered}
                  style={{ marginTop: "0.5rem" }}
                  color="primary"
                  variant={isButtonOutlined ? "outlined" : "contained"}
                  id="upButton"
               >
                  {value?.length ? `Change ${label}` : `Upload ${label}`}
               </Button>
            </Box>
         )}
         <Collapse
            in={Boolean(filePickerError)}
            sx={{ textAlignLast: "center" }}
         >
            <FormHelperText error>{filePickerError}</FormHelperText>
         </Collapse>
      </>
   )

   const renderCard = (): JSX.Element => {
      if (value.length) {
         // render image card with selected image
         return (
            <Box
               component={CardMedia}
               position="relative"
               border="dashed"
               borderRadius={6}
               borderColor={theme.palette.grey.A400}
            >
               {renderFilePicker(
                  <Box position="absolute" right={0} m={2}>
                     <Button
                        startIcon={<PublishIcon />}
                        size="small"
                        variant="contained"
                        color="inherit"
                        sx={{
                           textTransform: "none",
                           color: theme.palette.secondary.main,
                           backgroundColor: theme.palette.grey.A100,
                           boxShadow: 0,
                           py: 0.5,
                           px: 2,
                        }}
                     >
                        <Typography variant="subtitle2">
                           {changeImageButtonLabel || "Upload New"}
                        </Typography>
                     </Button>
                  </Box>
               )}
               <Box
                  className={classes.media}
                  px={1}
                  sx={{ height: "370px !important" }}
               >
                  <img src={value} className={classes.image} alt={formName} />
               </Box>
            </Box>
         )
      }
      // render image card without any selected image
      return (
         <Box mb={4}>
            <Box
               p={2}
               component={CardMedia}
               border="dashed"
               borderColor={
                  filePickerError
                     ? theme.palette.error.main
                     : theme.palette.grey.A400
               }
               borderRadius={6}
               id={formName}
            >
               <Box mt={1}>
                  <Typography variant="h6" textAlign="center">
                     {label}
                  </Typography>
               </Box>

               <Box className={classes.media} my={2}>
                  <img
                     src={logoPlaceholder}
                     className={classes.image}
                     alt={formName}
                  />
               </Box>

               {renderFilePicker(
                  <Box mb={1} display="flex" justifyContent="center">
                     <Button
                        id="upButton"
                        color="secondary"
                        sx={{
                           p: 0,
                           textTransform: "none",
                           minWidth: "fit-content",
                        }}
                     >
                        <Typography variant="h6">Upload</Typography>
                     </Button>
                     <Typography variant="h6" textAlign="center" ml={1}>
                        your image here
                     </Typography>
                  </Box>
               )}

               {resolution ? (
                  <Box mb={2}>
                     <Typography
                        fontSize="12px"
                        textAlign="center"
                        color="text.secondary"
                     >
                        <strong style={{ fontWeight: 500 }}>
                           Recommended Resolution:
                        </strong>{" "}
                        {resolution}
                     </Typography>
                  </Box>
               ) : null}
            </Box>
            <Collapse in={Boolean(filePickerError)} sx={{ ml: 2 }}>
               <FormHelperText error>{filePickerError}</FormHelperText>
            </Collapse>
         </Box>
      )
   }

   return isAvatar ? renderAvatar() : renderCard()
}

export default ImageSelect
