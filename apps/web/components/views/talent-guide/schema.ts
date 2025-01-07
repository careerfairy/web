import { FEEDBACK_TAG_CATEGORY } from "@careerfairy/shared-lib/talent-guide/types"
import * as yup from "yup"

export const tags = Object.values(FEEDBACK_TAG_CATEGORY)

export const feedbackSchema = yup.object({
   rating: yup.number().min(1).max(5).required("Please provide a rating"),
   tags: yup
      .array()
      .of(
         yup
            .string()
            .oneOf(Object.values(FEEDBACK_TAG_CATEGORY).map((tag) => tag.id))
      ),
})

export type FeedbackFormData = yup.InferType<typeof feedbackSchema>
