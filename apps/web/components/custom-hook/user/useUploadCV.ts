import { useCallback, useMemo, useState } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"
import { useAuth } from "../../../HOCs/AuthProvider"
import { userRepo } from "../../../data/RepositoryInstances"
import { rewardService } from "../../../data/firebase/RewardService"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import { FileUploaderProps } from "../../views/common/FileUploader"
import useFirebaseUpload from "../useFirebaseUpload"
import useSnackbarNotifications from "../useSnackbarNotifications"

type UseUploadCV = {
   handleUploadCV: (file: File) => Promise<void>
   handleError: (errorMsg: string) => void
   cvUploaded: boolean
   isLoading: boolean
   dragActive: boolean
   setDragActive: (dragActive: boolean) => void
   progress: number
   uploading: boolean
   fileUploaderProps: FileUploaderProps
}

type UseUploadCVOptions = {
   onSuccess?: () => void
}

/**
 * Hook that provides functionality to upload a user's CV to Firebase storage.
 * @returns An object containing upload related state and methods.
 */
const useUploadCV = ({ onSuccess }: UseUploadCVOptions = {}) => {
   const { userPresenter, userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const [loading, setLoading] = useState(false)
   const [dragActive, setDragActive] = useState(false)
   const [upload, progress, uploading] = useFirebaseUpload()

   const handleUploadCV = useCallback(
      async (file: File) => {
         try {
            setLoading(true)
            const path = userPresenter.getResumePath()
            const url = await upload(file, path)

            await userRepo.updateResume(userData?.userEmail, url)
            rewardService.userAction("USER_CV_UPLOAD").catch(errorLogAndNotify)
            successNotification("Your CV was uploaded!")
            dataLayerEvent(AnalyticsEvents.ProfileCvUpload)
            onSuccess && onSuccess()
         } catch (error) {
            errorNotification(error)
         } finally {
            setLoading(false)
         }
      },
      [
         upload,
         userPresenter,
         userData,
         errorNotification,
         successNotification,
         onSuccess,
      ]
   )

   const handleError = useCallback(
      (errorMsg: string) => {
         errorNotification(errorMsg, errorMsg)
      },
      [errorNotification]
   )

   const cvUploaded = Boolean(userData?.userResume)

   const isLoading = loading || uploading

   return useMemo<UseUploadCV>(
      () => ({
         handleUploadCV,
         handleError,
         cvUploaded,
         isLoading,
         dragActive,
         setDragActive,
         progress,
         uploading,
         fileUploaderProps: {
            onTypeError: handleError,
            onSizeError: handleError,
            types: ["pdf"],
            multiple: false,
            maxSize: 10,
            disabled: isLoading,
            onDraggingStateChange: setDragActive,
            handleChange: handleUploadCV,
         },
      }),
      [
         cvUploaded,
         dragActive,
         handleError,
         handleUploadCV,
         isLoading,
         progress,
         uploading,
      ]
   )
}

export default useUploadCV
