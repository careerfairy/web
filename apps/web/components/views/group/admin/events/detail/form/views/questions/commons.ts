import * as yup from "yup"

export type FeedbackQuestionFormValues = {
   title: string
   type: string
   appearAfter: number
}

export const feedbackQuestionFormInitialValues: FeedbackQuestionFormValues = {
   title: "",
   type: "",
   appearAfter: undefined,
}

export const feedbackQuestionValidationSchema = () =>
   yup.object().shape({
      title: yup.string().required("Required"),
      type: yup.string().required("Required"),
      appearAfter: yup.string().required("Required"),
   })
