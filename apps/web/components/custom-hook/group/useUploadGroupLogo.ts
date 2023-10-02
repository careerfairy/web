import { groupRepo } from "data/RepositoryInstances"
import useUploadImage, { UseUploadImage } from "../useUploadImage"

/**
 * useUploadGroupLogo is a custom hook for uploading group logos and updating the group data in firebase
 * @param groupId the id of the group to upload the logo for
 * @returns a UseUploadImage object containing the handleUploadImage function, imageUploaded state variable, and isLoading state variable
 *
 * @example
 * // Usage:
 * const { handleUploadImage, imageUploaded, isLoading } = useUploadGroupLogo("groupId");
 * // To upload an image:
 * handleUploadImage(file);
 */
const useUploadGroupLogo = (groupId: string): UseUploadImage => {
   return useUploadImage(`groups/${groupId}/logos`, (image) =>
      groupRepo.updateGroupLogo(groupId, image)
   )
}

export default useUploadGroupLogo
