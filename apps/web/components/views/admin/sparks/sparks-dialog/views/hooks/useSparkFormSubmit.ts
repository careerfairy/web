import { FormikHelpers } from "formik"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import useUploadSparkVideo from "components/custom-hook/sparks/useUploadSparkVideo"
import { useSparksForm } from "../../SparksDialog"

export type FormValues = {
   category: Spark["category"]["id"] | ""
   question: string
   videoFile: File
   videoId: string
   published: "true" | "false" // visibility
   videoUrl?: string
   id?: string
}

/**
 * Returns a callback for submitting the form. This callback handles the upload of
 * the video, the creation or update of a spark, and the navigation to the
 * selected view.
 * @returns {Function} The callback to be passed to Formik's onSubmit prop.
 */
const useSparkFormSubmit = () => {
   const { handleUploadFile } = useUploadSparkVideo()
   const { goToCreatorSelectedView } = useSparksForm()
   const selectedCreatorId = useSelector(sparksSelectedCreatorId)
   const dispatch = useDispatch()

   const handleSubmit = useCallback(
      async (
         values: FormValues,
         { setSubmitting, setFieldError }: FormikHelpers<FormValues>
      ) => {
         let videoUrl = values.videoUrl
         let sparkVideoId = values.videoId

         let sparkId = values?.id

         if (values.videoFile) {
            const { url, videoId } = await handleUploadFile(values.videoFile)

            videoUrl = url
            sparkVideoId = videoId
         }

         if (sparkId) {
            // update spark
         } else {
            // create new spark
         }

         setSubmitting(false)

         goToCreatorSelectedView(sparkId)
      },
      [handleUploadFile, goToCreatorSelectedView]
   )

   return handleSubmit
}

export default useSparkFormSubmit
