import { useCallback, useMemo } from "react"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import useSWRMutation from "swr/mutation"
import { SortablePhoto } from "./PhotosGallery"
import { mapGroupPhotos } from "./util"
import { Group, GroupPhoto } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "../../../../data/RepositoryInstances"
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

type Arguments = {
   newPhotos: GroupPhoto[]
   groupId: string
   type: "replace" | "add"
}

const handleUpdatePhotos = (
   key: string,
   { arg: { newPhotos, groupId, type } }: { arg: Arguments }
) => groupRepo.updateGroupPhotos(groupId, newPhotos, type)

const useGroupPhotos = (
   group: Group,
   presenter: GroupPresenter
): {
   /*
    * Photos to be consumed by the PhotosGallery component
    * */
   photos: SortablePhoto[]
   updateSortablePhotos: (newPhotos: SortablePhoto[]) => Promise<void>
   handleUploadPhotos: (newPhotos: File[]) => Promise<void>
   isUpdating: boolean
} => {
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `update-group-${group.id}-photos`,
      handleUpdatePhotos,
      {
         onSuccess: () => {
            successNotification("Photos updated successfully")
         },
         onError: (err) => {
            errorNotification(err.message)
         },
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above
      }
   )

   const updateSortablePhotos = useCallback(
      (newPhotos: SortablePhoto[]) => {
         return trigger({
            newPhotos: newPhotos.map((photo) => ({
               id: photo.id,
               url: photo.src,
            })),
            groupId: group.id,
            type: "replace",
         })
      },
      [group.id, trigger]
   )

   const handleUploadPhotos = useCallback(
      async (newPhotos: File[]) => {
         const storage = getStorage()
         const promises = newPhotos.map(async (photo) => {
            const photoId = uuidv4()

            const path = `${presenter.getCompanyPageImagePath()}/${photoId}`

            const photoRef = ref(storage, path)

            const metaData = await uploadBytes(photoRef, photo)

            const downloadURL = await getDownloadURL(metaData.ref)

            return {
               id: photoId,
               url: downloadURL,
            }
         })
         const results = await Promise.all(promises)

         return trigger({
            newPhotos: results,
            groupId: group.id,
            type: "add",
         })
      },
      [group.id, presenter, trigger]
   )

   const photos = useMemo<SortablePhoto[]>(
      () => mapGroupPhotos(group.photos ?? []),
      [group.photos]
   )

   return useMemo(
      () => ({
         photos,
         updateSortablePhotos,
         handleUploadPhotos,
         isUpdating: isMutating,
      }),
      [handleUploadPhotos, isMutating, photos, updateSortablePhotos]
   )
}

export default useGroupPhotos
