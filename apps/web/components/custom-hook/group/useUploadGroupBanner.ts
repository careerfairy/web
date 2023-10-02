import { groupRepo } from "data/RepositoryInstances"
import useUploadImage, { UseUploadImage } from "../useUploadImage"

/**
 * useUploadGroupLogo is a custom hook for uploading group banners and updating the group data in firebase
 * @param groupId the id of the group to upload the logo for
 * @returns a UseUploadImage object containing the handleUploadImage function, imageUploaded state variable, and isLoading state variable
 *
 * @example
 * // Usage:
 * const { handleUploadImage, imageUploaded, isLoading } = useUploadGroupLogo("groupId");
 * // To upload an image:
 * handleUploadImage(file);
 */
const useUploadGroupBanner = (groupId: string): UseUploadImage => {
   return useUploadImage(`groups/${groupId}/banners`, (image) =>
      groupRepo.updateGroupBanner(groupId, image)
   )
}

export default useUploadGroupBanner
