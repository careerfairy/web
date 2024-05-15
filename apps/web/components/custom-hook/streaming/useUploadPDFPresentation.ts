import { livestreamService } from "data/firebase/LivestreamService"
import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a livestream PDF presentation to Firebase storage.
 *
 * @returns An object containing upload related state and methods.
 */
const useUploadPDFPresentation = (livestreamId: string) => {
   return useUploadFile(
      `livestreams/${livestreamId}/presentations`,
      (url, fileName, fileExtension, fileSize) => {
         livestreamService.setLivestreamPDFPresentation({
            livestreamId,
            downloadUrl: url,
            fileSize: fileSize,
            fileName: `${fileName}.${fileExtension}`,
         })
      }
   )
}

export default useUploadPDFPresentation
