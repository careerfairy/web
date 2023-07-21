import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import useUploadSparkVideo from "components/custom-hook/spark/useUploadSparkVideo"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { sparkService } from "data/firebase/SparksService"
import { FormikHelpers } from "formik"
import { useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import { useSparksForm } from "../../SparksDialog"

export type SparkFormValues = {
   categoryId: Spark["category"]["id"] | ""
   question: string
   videoFile: File
   videoId: string
   published: "true" | "false" // visibility
   videoUrl?: string
   id?: string
}

type UseSparkFormSubmit = {
   handleSubmit: (
      values: SparkFormValues,
      formikHelpers: FormikHelpers<SparkFormValues>
   ) => Promise<void>
   progress: number
   uploading: boolean
   isLoading: boolean
}

/**
 * A hook to return a callback for submitting the form, along with the
 * progress and status of the operation. This callback handles the upload of
 * the video, the creation or update of a spark, and the navigation to the
 * selected view.
 * @returns {object} An object containing the following properties:
 * - `handleSubmit`: The callback to be passed to Formik's onSubmit prop.
 * - `progress`: The progress of the video upload operation.
 * - `uploading`: Boolean indicating if the video is being uploaded.
 * - `isLoading`: Boolean indicating if the handleUploadFile operation is loading.
 */
const useSparkFormSubmit = (groupId: string): UseSparkFormSubmit => {
   const { handleUploadFile, progress, uploading, isLoading } =
      useUploadSparkVideo()
   const { handleClose } = useSparksForm()
   const selectedCreatorId = useSelector(sparksSelectedCreatorId)
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const handleSubmit = useCallback<UseSparkFormSubmit["handleSubmit"]>(
      async (values, { setSubmitting, setFieldError }) => {
         try {
            let videoUrl = values.videoUrl
            let sparkVideoId = values.videoId
            const published = values.published === "true"

            if (!values.categoryId) {
               setFieldError("categoryId", "Category is required")
               return
            }

            let sparkId = values?.id

            if (values.videoFile) {
               const { url, uid } = await handleUploadFile(values.videoFile)

               videoUrl = url
               sparkVideoId = uid
            }

            if (sparkId) {
               // TODO: update spark
            } else {
               // create new spark
               await sparkService.createSpark({
                  categoryId: values.categoryId,
                  question: values.question,
                  videoId: sparkVideoId,
                  published,
                  videoUrl,
                  groupId,
                  creatorId: selectedCreatorId,
               })
            }

            setSubmitting(false)
            successNotification("Spark created successfully")
            handleClose()
         } catch (err) {
            errorNotification(err, "Error creating spark, please try again")
         }
      },
      [
         errorNotification,
         groupId,
         handleClose,
         handleUploadFile,
         selectedCreatorId,
         successNotification,
      ]
   )

   return useMemo<UseSparkFormSubmit>(
      () => ({
         handleSubmit,
         progress,
         uploading,
         isLoading,
      }),
      [handleSubmit, isLoading, progress, uploading]
   )
}

export default useSparkFormSubmit
