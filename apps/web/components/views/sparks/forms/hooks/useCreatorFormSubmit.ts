import useUploadCreatorAvatar from "components/custom-hook/creator/useUploadCreatorAvatar"
import { groupRepo } from "data/RepositoryInstances"
import { FormikHelpers } from "formik"
import { useCallback, useMemo } from "react"

export type CreatorFormValues = {
   avatarUrl: string
   avatarFile: File | null
   firstName: string
   lastName: string
   position: string
   linkedInUrl: string
   story: string
   email: string
   id?: string
}

type UseCreatorFormSubmit = {
   handleSubmit: (
      values: CreatorFormValues,
      formikHelpers: FormikHelpers<CreatorFormValues>
   ) => Promise<void>
   progress: number
   uploading: boolean
   isLoading: boolean
}

/**
 * A hook to return a callback for submitting the form, along with the
 * progress and status of the operation. This callback handles the upload of
 * the avatar, the creation or update of a creator, and the navigation to the
 * selected view.
 * @returns {object} An object containing the following properties:
 * - `handleSubmit`: The callback to be passed to Formik's onSubmit prop.
 * - `progress`: The progress of the avatar upload operation.
 * - `uploading`: Boolean indicating if the avatar is being uploaded.
 * - `isLoading`: Boolean indicating if the handleSubmit operation is loading.
 */
const useCreatorFormSubmit = (
   groupId: string,
   onSubmited: (creatorId: string) => void
): UseCreatorFormSubmit => {
   const { handleUploadFile, isLoading, uploading, progress } =
      useUploadCreatorAvatar(groupId)

   const handleSubmit = useCallback<UseCreatorFormSubmit["handleSubmit"]>(
      async (values, { setSubmitting, setFieldError }) => {
         let avatarUrl = values.avatarUrl
         let creatorId = values?.id

         if (values.avatarFile) {
            avatarUrl = (await handleUploadFile(values.avatarFile)).url
         }

         // Before making the request, we validate if the email is unique
         if (
            !creatorId &&
            !(await groupRepo.creatorEmailIsUnique(groupId, values.email))
         ) {
            // If the email is not unique and we are trying to create a new creator
            // we set an error to the email field and prevent the form from being submitted
            setFieldError("email", "Email has already been taken")
            setSubmitting(false)
            return
         }

         if (creatorId) {
            await groupRepo.updateCreatorInGroup(groupId, creatorId, {
               avatarUrl,
               firstName: values.firstName,
               lastName: values.lastName,
               position: values.position,
               linkedInUrl: values.linkedInUrl,
               story: values.story,
               id: creatorId,
            })
         } else {
            creatorId = await groupRepo.addCreatorToGroup(groupId, {
               avatarUrl,
               email: values.email,
               firstName: values.firstName,
               lastName: values.lastName,
               position: values.position,
               linkedInUrl: values.linkedInUrl,
               story: values.story,
            })
         }

         setSubmitting(false)

         if (onSubmited) {
            onSubmited(creatorId)
         }
      },
      [groupId, handleUploadFile, onSubmited]
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

export default useCreatorFormSubmit
