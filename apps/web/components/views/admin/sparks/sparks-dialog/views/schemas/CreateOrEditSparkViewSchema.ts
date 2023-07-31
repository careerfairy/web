import { SparksCategories } from "@careerfairy/shared-lib/sparks/sparks"
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
         .required("Video is required"),
   }),
   videoId: yup.string().nullable(),
   published: yup.string().oneOf(publishedValues).required(),
})

export default CreateOrEditSparkViewSchema
