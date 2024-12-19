import { TAG_CATEGORY } from "@careerfairy/shared-lib/talent-guide/types"
import * as yup from "yup"

export const tags = Object.values(TAG_CATEGORY)

export const feedbackSchema = yup.object({
   rating: yup.number().min(1).max(5).required("Please provide a rating"),
   tags: yup
      .array()
      .of(yup.string().oneOf(Object.values(TAG_CATEGORY)))
      .min(1, "Please select at least one tag")
      .required(),
})

export type FeedbackFormData = yup.InferType<typeof feedbackSchema>
