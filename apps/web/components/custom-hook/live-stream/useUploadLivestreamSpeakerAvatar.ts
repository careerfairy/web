import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a creator's avatar to Firebase storage.
 * @param livestream The ID of the group the creator belongs to.
 * @returns An object containing upload related state and methods.
 * */
export const useUploadLivestreamSpeakerAvatar = () => {
   return useUploadFile(`mentors-pictures`)
}
