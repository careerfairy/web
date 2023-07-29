import { Box, SxProps, Theme } from "@mui/material"
import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"

type Props = {
   children: JSX.Element
   label?: string
   sx?: SxProps<Theme>
   onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export const FileDropZone = ({ children, label, sx = {} }: Props) => {
   const onDrop = useCallback((acceptedFiles) => {
      return acceptedFiles.map((file) =>
         Object.assign(file, {
            preview: URL.createObjectURL(file),
         })
      )
   }, [])

   const { getRootProps, getInputProps } = useDropzone({ onDrop })

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
