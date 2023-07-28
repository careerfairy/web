import { SparksCategories } from "@careerfairy/shared-lib/sparks/sparks"
import * as yup from "yup"
import { publishedOptions } from "../components/SparkVisibilitySelect"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"

const categories = Object.values(SparksCategories).map(
   (category) => category.id
)

const publishedValues = publishedOptions.map((option) => option.value)

const CreateOrEditSparkViewSchema = yup.object().shape({
   categoryId: yup.string().oneOf(categories).required("Category is required"),
   question: yup
      .string()
      .required()
      .max(SPARK_CONSTANTS.QUESTION_MAX_LENGTH)
      .min(SPARK_CONSTANTS.QUESTION_MIN_LENGTH),
   video: yup
      .object()
      .shape({
         uid: yup.string().required(),
         fileExtension: yup.string().required(),
         url: yup.string().required(),
         thumbnailUrl: yup.string().required(),
      })
      .required(),
   published: yup.string().oneOf(publishedValues).required(),
})

export default CreateOrEditSparkViewSchema
