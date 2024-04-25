import { FileUploaderProps } from "components/views/common/FileUploader"
import { useCallback, useState, useMemo } from "react"
import useSnackbarNotifications from "./useSnackbarNotifications"

type UseFileUploaderParams = {
   acceptedFileTypes: FileUploaderProps["types"]
   maxFileSize: number
   multiple?: boolean
   onValidated: (file: File | File[]) => void
   customValidations?: FileUploaderProps["customValidations"]
}

type UseFileUploader = {
   fileUploaderProps: FileUploaderProps
   dragActive: boolean
}

const useFileUploader = ({
   acceptedFileTypes,
   maxFileSize,
   multiple = false,
   onValidated: onSelect,
   customValidations,
}: UseFileUploaderParams): UseFileUploader => {
   const [dragActive, setDragActive] = useState(false)
   const { errorNotification } = useSnackbarNotifications()

   const handleError = useCallback(
      (errorMsg: string) => {
         errorNotification(errorMsg, errorMsg)
      },
      [errorNotification]
   )

   return useMemo<UseFileUploader>(
      () => ({
         fileUploaderProps: {
            onTypeError: handleError,
            onSizeError: handleError,
            onCustomError: handleError,
            types: acceptedFileTypes,
            multiple: multiple,
            maxSize: maxFileSize,
            onDraggingStateChange: setDragActive,
            handleChange: onSelect,
            customValidations,
         },
         dragActive,
      }),
      [
         handleError,
         acceptedFileTypes,
         multiple,
         maxFileSize,
         onSelect,
         customValidations,
         dragActive,
      ]
   )
}

export default useFileUploader
