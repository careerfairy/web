import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a creator's avatar to Firebase storage.
 * @param groupId The ID of the group the creator belongs to.
 * @returns An object containing upload related state and methods.
 * */
const useUploadCreatorAvatar = (groupId: string) => {
   return useUploadFile(`groups/${groupId}/creator-avatars`)
}

export default useUploadCreatorAvatar
