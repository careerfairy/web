import * as yup from "yup"

export const ESTIMATED_DURATIONS = [
   { minutes: 15, name: "15 minutes" },
   { minutes: 30, name: "30 minutes" },
   { minutes: 45, name: "45 minutes" },
   {
      minutes: 60,
      name: "1 hour",
   },
   { minutes: 75, name: "1 hour 15 minutes" },
   { minutes: 90, name: "1 hour 30 minutes" },
   { minutes: 105, name: "1 hour 45 minutes" },
   {
      minutes: 120,
      name: "2 hours",
   },
   { minutes: 135, name: "2 hours 15 minutes" },
   { minutes: 150, name: "2 hours 30 minutes" },
   { minutes: 165, name: "2 hours 45 minutes" },
   {
      minutes: 180,
      name: "3 hours",
   },
]

export type FeedbackQuestionFormValues = {
   title: string
   type: string
   appearAfter: number
}

export type FeedbackQuestionsProp = {
   questions: FeedbackQuestionFormValues[]
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
