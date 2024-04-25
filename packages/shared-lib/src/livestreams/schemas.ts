import * as yup from "yup"
import { LivestreamPoll } from "./livestreams"

export const basePollShape = {
   question: yup
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters long"),
   options: yup
      .array()
      .of(
         yup.object({
            text: yup
               .string()
               .trim()
               .min(1, "Option must be at least 1 character")
               .required("Option is required"),
            id: yup.string().optional(),
         })
      )
      .min(2, "At least 2 options are required")
      .max(5, "Max 5 options are allowed")
      .test("unique-options", "Options must be unique", (options) => {
         const texts = options?.map((option) => option.text) || []
         const uniqueTexts = new Set(texts)
         return uniqueTexts.size === texts.length
      }),
   state: yup
      .mixed<LivestreamPoll["state"]>()
      .oneOf(["closed", "current", "upcoming"]),
}
