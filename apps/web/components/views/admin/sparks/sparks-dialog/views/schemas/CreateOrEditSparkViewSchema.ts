import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { SparksCategories } from "@careerfairy/shared-lib/sparks/sparks"
import { mapOptions } from "components/views/signup/utils"
import * as yup from "yup"
import { publishedOptions } from "../components/SparkVisibilitySelect"

const categories = Object.values(SparksCategories).map(
   (category) => category.id
)

const languages = mapOptions(languageOptionCodes)

const publishedValues = publishedOptions.map((option) => option.value)

const CreateOrEditSparkViewSchema = yup.object().shape({
   categoryId: yup.string().oneOf(categories).required("Category is required"),
   languageId: yup.string().oneOf(languages).required("Language is required"),
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
