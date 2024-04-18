import { FileUploaderProps } from "components/views/common/FileUploader"
import { useCallback, useMemo, useState } from "react"
import useSnackbarNotifications from "./useSnackbarNotifications"

type UseFileUploaderParams = {
   acceptedFileTypes: FileUploaderProps["types"]
   maxFileSize: number
   multiple?: boolean
   onValidated: (file: File | File[]) => void
   onCancel?: FileUploaderProps["onCancel"]
   customValidations?: FileUploaderProps["customValidations"]
   name?: FileUploaderProps["name"]
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
   onCancel,
   name,
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
            onCancel,
            name,
         },
         dragActive,
      }),
      [
         handleError,
         acceptedFileTypes,
         multiple,
         maxFileSize,
         onSelect,
         onCancel,
         customValidations,
         dragActive,
         name,
      ]
   )
}

export default useFileUploader
