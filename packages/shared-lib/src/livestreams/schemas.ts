import * as yup from "yup"

export const basePollSchema = yup.object({
   question: yup
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters long")
      .required("Question is required"),
   options: yup
      .array()
      .of(
         yup.object({
            text: yup
               .string()
               .trim()
               .min(1, "Option must be at least 1 character")
               .required("Option is required"),
            id: yup.string().required(),
         })
      )
      .min(2, "At least 2 options are required")
      .max(5, "Max 5 options are allowed"),
})
