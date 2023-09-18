import { Box, SxProps, Theme } from "@mui/material"
import React, { FC, useCallback } from "react"
import { DropEvent, FileRejection, useDropzone } from "react-dropzone"

type Props = {
   children?: JSX.Element
   label?: string
   sx?: SxProps<Theme>
   onChange?: <T extends File>(
      acceptedFiles: T[],
      fileRejections: FileRejection[],
      event: DropEvent
   ) => void
}

export const FileDropZone: FC<Props> = ({
   children,
   label,
   sx = {},
   onChange,
}) => {
   const onDrop = (acceptedFiles) =>
      acceptedFiles.map((file) =>
         Object.assign(file, {
            preview: URL.createObjectURL(file),
         })
      )

   const { getRootProps, getInputProps } = useDropzone({
      onDrop: onChange ?? onDrop,
   })

   return (
      <Box sx={sx} {...getRootProps()}>
         <input {...getInputProps()} />
         {!Boolean(children) ? (
            <p>
               {label ??
                  "Drag 'n' drop some files here, or click to select files"}
            </p>
         ) : (
            children
         )}
      </Box>
   )
}
