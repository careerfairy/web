import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a creator's avatar to Firebase storage.
 *
 * @returns An object containing upload related state and methods.
 */
const useUploadSparkVideo = () => {
   return useUploadFile(`sparks/videos`)
}

export default useUploadSparkVideo
