import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Spark, SparkVideo } from "@careerfairy/shared-lib/sparks/sparks"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { sleep } from "components/helperFunctions/HelperFunctions"
import { sparkService } from "data/firebase/SparksService"
import { FormikHelpers } from "formik"
import { useCallback, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { closeSparkDialog } from "store/reducers/adminSparksReducer"

export type SparkFormValues = {
   categoryId: Spark["category"]["id"] | ""
   question: string
   published: "true" | "false" // visibility
   video: SparkVideo
   id?: string
   creator: PublicCreator
}

type UseSparkFormSubmit = {
   handleSubmit: (
      values: SparkFormValues,
      formikHelpers: FormikHelpers<SparkFormValues>
   ) => Promise<void>
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
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const [formSubmitting, setFormSubmitting] = useState(false)

   const dispatch = useDispatch()

   const handleClose = useCallback(() => {
      dispatch(
         closeSparkDialog({
            forceClose: true,
         })
      )
   }, [dispatch])

   const handleSubmit = useCallback<UseSparkFormSubmit["handleSubmit"]>(
      async (values, { setSubmitting, setFieldError, resetForm }) => {
         try {
            setFormSubmitting(true)
            const published = values.published === "true"

            if (!values.categoryId) {
               setFieldError("categoryId", "Category is required")
               return
            }

            let sparkId = values?.id

            if (sparkId) {
               // TODO: update spark
            } else {
               // create new spark
               await sparkService.createSpark({
                  categoryId: values.categoryId,
                  question: values.question,
                  video: values.video,
                  published,
                  groupId,
                  creatorId: values.creator.id,
               })
            }

            await sleep(2000) // wait for 2 seconds for UX purposes

            setSubmitting(false)
            successNotification("Spark created successfully")
            handleClose()
         } catch (err) {
            errorNotification(err, "Error creating spark, please try again")
         } finally {
            setFormSubmitting(false)
         }
      },
      [errorNotification, groupId, handleClose, successNotification]
   )

   return useMemo<UseSparkFormSubmit>(
      () => ({
         handleSubmit,
         isLoading: formSubmitting,
      }),
      [formSubmitting, handleSubmit]
   )
}

export default useSparkFormSubmit
