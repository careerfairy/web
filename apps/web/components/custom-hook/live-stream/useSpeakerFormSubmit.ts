import { mapCreatorToSpeaker } from "@careerfairy/shared-lib/groups/creators"
import { CreateCreatorSchemaType } from "@careerfairy/shared-lib/groups/schemas"
import { livestreamService } from "data/firebase/LivestreamService"
import { useCallback, useMemo } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useUploadLivestreamSpeakerAvatar } from "./useUploadLivestreamSpeakerAvatar"

type UseCreatorFormSubmit = {
   handleSubmit: (values: CreateCreatorSchemaType) => Promise<void>
   progress: number
   uploading: boolean
   isLoading: boolean
}

/**
 * This hook adds or updates a speaker to a live stream outside the group
 * dashboard, requiring the live stream token for validation.
 */
export const useSpeakerFormSubmit = (
   livestreamId: string,
   livestreamToken: string
): UseCreatorFormSubmit => {
   const { handleUploadFile, isLoading, uploading, progress } =
      useUploadLivestreamSpeakerAvatar()

   const handleSubmit = useCallback<UseCreatorFormSubmit["handleSubmit"]>(
      async (values) => {
         try {
            if (values.avatarFile) {
               values.avatarUrl = (
                  await handleUploadFile(values.avatarFile)
               ).url
            }

            const speaker = mapCreatorToSpeaker(values)

            return livestreamService.upsertLivestreamSpeaker({
               livestreamId,
               livestreamToken,
               speaker,
            })
         } catch (error) {
            errorLogAndNotify(error, {
               message: "Failed to add speaker to livestream",
               values,
               livestreamId,
               livestreamToken,
            })
         }
      },
      [handleUploadFile, livestreamId, livestreamToken]
   )

   return useMemo<UseCreatorFormSubmit>(
      () => ({
         handleSubmit,
         progress,
         uploading,
         isLoading,
      }),
      [handleSubmit, isLoading, progress, uploading]
   )
}
