import { livestreamRepo } from "data/RepositoryInstances"
import useUploadImage, { UseUploadImage } from "../useUploadImage"

/**
 * useUploadLivestreamLogo is a custom hook for uploading live stream company logos and updating the livestream data in firebase.
 * It also takes into account the draft state of the livestream.
 * @param livestreamId the id of the live/draft stream document to upload the company logo for
 * @param isDraft a boolean indicating whether the livestream is a draft or not. If it's a draft, the livestreamId is not set and the company logo field won't be updated.
 * @returns a UseUploadImage object containing the handleUploadImage function, imageUploaded state variable, and isLoading state variable
 *
 * @example
 * // Usage:
 * const { handleUploadImage, imageUploaded, isLoading } = useUploadLivestreamLogo("livestreamId", true);
 * // To upload an image:
 * handleUploadImage(file);
 */
const useUploadLivestreamLogo = (
   livestreamId: string,
   isDraft: boolean
): UseUploadImage => {
   return useUploadImage(`company-logos`, (image) => {
      if (!livestreamId) return // Don't update if the id is not set as it's an unsaved draft
      return livestreamRepo.updateLivestreamLogo(livestreamId, isDraft, image)
   })
}

export default useUploadLivestreamLogo
