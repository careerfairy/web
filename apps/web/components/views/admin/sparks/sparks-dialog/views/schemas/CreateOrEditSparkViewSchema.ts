import { SparksCategories } from "@careerfairy/shared-lib/sparks/sparks"
import { getVideoFileDuration } from "components/helperFunctions/validators/video"
import * as yup from "yup"
import { publishedOptions } from "../components/SparkVisibilitySelect"

const categories = Object.values(SparksCategories).map(
   (category) => category.id
)

const publishedValues = publishedOptions.map((option) => option.value)

const CreateOrEditSparkViewSchema = yup.object().shape({
   categoryId: yup.string().oneOf(categories).required("Category is required"),
   question: yup.string().required().max(100).min(10),
   videoFile: yup.mixed<File>().when("videoId", {
      is: (videoId: string) => {
         return !videoId
      }, // if videoId is not set
      then: yup // then videoFile is required
         .mixed<File>()
         .required("Video is required")
         .test("videoFile", "Video is required", function (value) {
            return Boolean(value)
         })
         .test(
            "videoFile",
            "Video length should be between 10 and 60 seconds",
            async function (value) {
               try {
                  const duration = await getVideoFileDuration(value)
                  if (duration < 10 || duration > 60) {
                     // min 10 seconds, max 60 seconds
                     return this.createError({
                        message: `Invalid video length. Your video is ${duration.toFixed(
                           2
                        )} seconds long, but it should be between 10 and 60 seconds.`,
                     })
                  }
                  return true
               } catch (err) {
                  return this.createError({
                     message: err,
                  })
               }
            }
         ),
   }),
   videoId: yup.string().nullable(),
   published: yup.string().oneOf(publishedValues).required(),
})

export default CreateOrEditSparkViewSchema
