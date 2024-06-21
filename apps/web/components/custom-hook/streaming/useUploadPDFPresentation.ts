import { STORAGE_PATHS } from "@careerfairy/shared-lib/constants/storagePaths"
import { livestreamService } from "data/firebase/LivestreamService"
import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a live stream PDF presentation to Firebase storage.
 *
 * @returns An object containing upload related state and methods.
 */
const useUploadPDFPresentation = (livestreamId: string) => {
   return useUploadFile(
      STORAGE_PATHS.presentations,
      (downloadUrl, storagePath, file) => {
         livestreamService.setLivestreamPDFPresentation({
            livestreamId,
            downloadUrl,
            storagePath,
            fileSize: file.size,
            fileName: file.name, // original file name to preview in the UI
         })
      }
   )
}

export default useUploadPDFPresentation
