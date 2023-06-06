import React, { useEffect, useRef } from "react"
import useDragging from "./useDragging"
import { acceptedExt, checkType, getFileSizeMB } from "./utils"
import { Box } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { SxProps } from "@mui/system"
import { DefaultTheme } from "@mui/styles/defaultTheme"

const styles = sxStyles({
   root: {
      position: "relative",
      "&:focus-within": {
         outline: "2px solid black",
      },
      "& > input": {
         display: "block",
         opacity: 0,
         position: "absolute",
         pointerEvents: "none",
      },
   },
})

/*
 * Code taken from: https://github.com/KarimMokhtar/react-drag-drop-files
 * and modified to fit our needs with better error handling and no styles, thanks Karim!
 * */

export type FileUploaderProps = {
   name?: string
   /*
    * ['png', 'jpeg', ...]
    * */
   types?: Array<string>
   sx?: SxProps<DefaultTheme>
   classes?: string
   children?: JSX.Element
   maxSize?: number
   minSize?: number
   fileOrFiles?: Array<File> | File | null
   disabled?: boolean | false
   multiple?: boolean | false
   required?: boolean | false
   onSizeError?: (message: string) => void
   onTypeError?: (message: string) => void
   onDrop?: (file: File | Array<File>) => void
   onSelect?: (file: File | Array<File>) => void
   handleChange?: (fileOrFiles: Array<File> | File) => void
   onDraggingStateChange?: (dragging: boolean) => void
}

/**
 * File uploading main function
 * @param props - {name,
    types,
    handleChange,
    classes,
    children,
    maxSize,
    minSize,
    fileOrFiles,
    onSizeError,
    onTypeError,
    onSelect,
    onDrop,
    onTypeError,
    disabled,
    multiple,
    required,
    onDraggingStateChange
  }
 * @returns JSX Element
 */
const FileUploader: React.FC<FileUploaderProps> = (
   props: FileUploaderProps
): JSX.Element => {
   const {
      name,
      types,
      handleChange,
      classes,
      children,
      maxSize,
      minSize,
      fileOrFiles,
      onSizeError,
      onTypeError,
      onSelect,
      onDrop,
      disabled,
      multiple,
      required,
      onDraggingStateChange,
      sx,
   } = props
   const labelRef = useRef<HTMLLabelElement>(null)
   const inputRef = useRef<HTMLInputElement>(null)

   const validateFile = (file: File) => {
      const extension: string = file.name.split(".").pop() as string

      if (types && !checkType(file, types)) {
         // types included and type not in them
         if (onTypeError) onTypeError(`File type ${extension} is not supported`)
         return false
      }
      const fileSizeMB = getFileSizeMB(file.size)

      if (maxSize && fileSizeMB > maxSize) {
         if (onSizeError)
            onSizeError(
               `File size ${fileSizeMB.toFixed(
                  2
               )}MB is too big, max size is ${maxSize}MB`
            )
         return false
      }
      if (minSize && fileSizeMB < minSize) {
         if (onSizeError)
            onSizeError(
               `File size ${fileSizeMB.toFixed(
                  2
               )}MB is too small, min size is ${minSize}MB`
            )
         return false
      }
      return true
   }

   const handleChanges = (files: File | Array<File>): boolean => {
      let checkError = false
      if (files) {
         if (files instanceof File) {
            checkError = !validateFile(files)
         } else {
            for (let i = 0; i < files.length; i++) {
               const file = files[i]
               checkError = !validateFile(file) || checkError
            }
         }
         if (checkError) return false
         if (handleChange) handleChange(files)

         return true
      }
      return false
   }

   const blockEvent = (ev: any) => {
      ev.preventDefault()
      ev.stopPropagation()
   }
   const handleClick = (ev: any) => {
      ev.stopPropagation()
      // eslint-disable-next-line no-param-reassign
      if (inputRef && inputRef.current) {
         inputRef.current.click()
      }
   }

   const handleInputChange = (ev: any) => {
      const allFiles = ev.target.files
      const files = multiple ? allFiles : allFiles[0]
      const success = handleChanges(files)
      if (onSelect && success) onSelect(files)
   }
   const dragging = useDragging({
      labelRef,
      inputRef,
      multiple,
      handleChanges,
      onDrop,
   })

   useEffect(() => {
      onDraggingStateChange?.(dragging)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dragging])

   useEffect(() => {
      if (fileOrFiles) {
      } else {
         if (inputRef.current) inputRef.current.value = ""
      }
   }, [fileOrFiles])

   return (
      <Box
         component="label"
         sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
         className={classes}
         ref={labelRef}
         htmlFor={name}
         onClick={blockEvent}
      >
         <input
            onClick={handleClick}
            onChange={handleInputChange}
            accept={acceptedExt(types)}
            ref={inputRef}
            type="file"
            name={name}
            disabled={disabled}
            multiple={multiple}
            required={required}
         />
         {children}
      </Box>
   )
}
export default FileUploader
