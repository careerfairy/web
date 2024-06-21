import useUploadImage, { UseUploadImage } from "../useUploadImage"

/**
 * useUploadLivestreamBackgroundImage is a custom hook for uploading live stream background images.
 * @param livestreamId the id of the live stream document to upload the background image for
 * @returns a UseUploadImage object containing the handleUploadImage function, imageUploaded state variable, and isLoading state variable
 *
 * @example
 * // Usage:
 * const { handleUploadImage, imageUploaded, isLoading } = useUploadLivestreamBackgroundImage("livestreamId");
 * // To upload an image:
 * handleUploadImage(file);
 */
const useUploadLivestreamBackgroundImage = (
   livestreamId: string
): UseUploadImage => useUploadImage(`stream-background-images/${livestreamId}`)

export default useUploadLivestreamBackgroundImage
