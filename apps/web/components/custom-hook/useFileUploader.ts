import { FileUploaderProps } from "components/views/common/FileUploader"
import { useCallback, useState, useMemo } from "react"
import useSnackbarNotifications from "./useSnackbarNotifications"

type UseFileUploaderParams = {
   acceptedFileTypes: string[]
   maxFileSize: number
   multiple?: boolean
   onValidated: (file: File | File[]) => void
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
            types: acceptedFileTypes,
            multiple: multiple,
            maxSize: maxFileSize,
            onDraggingStateChange: setDragActive,
            handleChange: onSelect,
         },
         dragActive,
      }),
      [
         handleError,
         acceptedFileTypes,
         multiple,
         maxFileSize,
         onSelect,
         dragActive,
      ]
   )
}

export default useFileUploader
