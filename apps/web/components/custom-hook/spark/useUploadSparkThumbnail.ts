import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a spark's thumbnail to Firebase storage.
 *
 * @returns An object containing upload related state and methods.
 */
const useUploadSparkThumbnail = () => {
   return useUploadFile(`sparks/thumbnails`)
}

export default useUploadSparkThumbnail
