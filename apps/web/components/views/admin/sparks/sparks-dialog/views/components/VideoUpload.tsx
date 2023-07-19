import { Button, FormHelperText, Typography } from "@mui/material"
import { Box } from "@mui/material"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { imagePlaceholder } from "constants/images"
import { useField } from "formik"
import { T } from "lodash/fp"
import Image from "next/image"
import React, { FC, useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      border: "1px dashed rgba(153, 153, 177, 0.30)",
      flex: 1,
      borderRadius: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      "& label": {
         height: "inherit",
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         justifyContent: "center",
      },
      p: 3,
   },
   hovered: {
      border: "1px dashed rgba(153, 153, 177, 0.30)",
      backgroundColor: "rgba(153, 153, 177, 0.30)",
   },
   placeholderWrapper: {
      width: 124,
      height: 150,
      borderRadius: 1.5,
   },
   placeholderText: {
      color: "#7D7D7D",
      textAlign: "center",
      fontSize: "1rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "1.14286rem",
      whiteSpace: "nowrap",
   },
   uploadBtn: {
      whiteSpace: "nowrap",
      textTransform: "none",
   },
   helpText: {
      textAlign: "center",
   },
})
type Props = {
   name: string
}

const VideoUpload: FC<Props> = ({ name }) => {
   const [field, meta, helpers] = useField<File>(name)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["mp4", "webm"],
      maxFileSize: 150, // MB
      multiple: false,
      onValidated: (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         helpers.setValue(newFile)
         handleTouched()
      },
   })

   const handleTouched = useCallback(() => {
      helpers.setTouched(true, false)
   }, [helpers])

   const blobUrl = useMemo(() => {
      if (field.value) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value])

   return (
      <Box sx={[styles.root, dragActive && styles.hovered]}>
         <FileUploader {...fileUploaderProps}>
            <>
               <Box sx={styles.placeholderWrapper}>
                  <Image
                     alt="placeholder"
                     src={imagePlaceholder}
                     width={124}
                     height={150}
                     objectFit="contain"
                  />
               </Box>
               <Typography mt={2} mb={1} sx={styles.placeholderText}>
                  Upload your Spark
               </Typography>
               <Button
                  sx={styles.uploadBtn}
                  color="secondary"
                  variant="contained"
                  size="small"
               >
                  Upload video
               </Button>
               {meta.touched && meta.error ? (
                  <FormHelperText sx={styles.helpText} error>
                     {meta.error}
                  </FormHelperText>
               ) : null}
            </>
         </FileUploader>
      </Box>
   )
}

export default VideoUpload
