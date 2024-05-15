import { livestreamService } from "data/firebase/LivestreamService"
import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a livestream PDF presentation to Firebase storage.
 *
 * @returns An object containing upload related state and methods.
 */
const useUploadPDFPresentation = (livestreamId: string) => {
   return useUploadFile(`company-logos`, (downloadUrl, storagePath, file) => {
      livestreamService.setLivestreamPDFPresentation({
         livestreamId,
         downloadUrl,
         storagePath,
         fileSize: file.size,
         fileName: file.name, // original file name to preview in the UI
      })
   })
}

export default useUploadPDFPresentation
