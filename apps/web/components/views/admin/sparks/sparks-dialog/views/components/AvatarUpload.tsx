import CameraIcon from "@mui/icons-material/PhotoCameraOutlined"
import {
   Avatar,
   Box,
   CardActionArea,
   FormHelperText,
   Typography,
} from "@mui/material"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { useField } from "formik"
import { FC, Fragment, useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   avaRoot: {
      mx: "auto",
      width: 136,
      height: 136,
      borderRadius: "50%",
   },
   avatar: {
      width: "100%",
      height: "100%",
      bgcolor: "#F7F8FC",
      border: "1px solid #EDE7FD",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#9999B1",
      flexDirection: "column",
      transition: (theme) =>
         theme.transitions.create(["border", "background-color"]),
   },
   icon: {
      width: 36,
      height: 36,
   },
   uploadText: {
      textAlign: "center",
      fontSize: "0.85714rem !important",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "141%",
   },
   avatarUploaded: {
      border: (theme) => `2px solid ${theme.palette.grey[300]}`,
      bgcolor: "grey.50",
   },
   dragActive: {
      bgcolor: "secondary.main",
      color: "white",
   },
   helperText: {
      textAlign: "center",
   },
})

type Props = {
   groupId: string
   name: string
   remoteUrl?: string
}

const AvatarUpload: FC<Props> = ({ name, remoteUrl }) => {
   const [field, meta, helpers] = useField<File>(name)

   const handleTouched = useCallback(() => {
      helpers.setTouched(true, false)
   }, [helpers])

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"],
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         await helpers.setValue(newFile, false)
         handleTouched()
         helpers.setError(undefined)
      },
   })

   const blobUrl = useMemo(() => {
      if (field.value) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value])

   return (
      <Box
         display="flex"
         flexDirection="column"
         alignItems="center"
         justifyContent="center"
      >
         <FileUploader {...fileUploaderProps}>
            <CardActionArea onClick={handleTouched} sx={styles.avaRoot}>
               <Avatar
                  src={blobUrl || remoteUrl}
                  sx={[styles.avatar, dragActive && styles.dragActive]}
               >
                  <Fragment>
                     <CameraIcon sx={styles.icon} color="inherit" />
                     <Typography
                        color="inherit"
                        variant="h5"
                        sx={styles.uploadText}
                     >
                        Upload speaker picture
                     </Typography>
                  </Fragment>
               </Avatar>
            </CardActionArea>
         </FileUploader>
         {meta.touched && meta.error ? (
            <FormHelperText sx={styles.helperText} error>
               {meta.error}
            </FormHelperText>
         ) : null}
      </Box>
   )
}

export default AvatarUpload
