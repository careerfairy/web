import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import * as yup from "yup"

export const ESTIMATED_DURATIONS = [
   { minutes: 5, name: "5 minutes" },
   { minutes: 10, name: "10 minutes" },
   { minutes: 15, name: "15 minutes" },
   { minutes: 20, name: "20 minutes" },
   { minutes: 25, name: "25 minutes" },
   { minutes: 30, name: "30 minutes" },
   { minutes: 35, name: "35 minutes" },
   { minutes: 40, name: "40 minutes" },
   { minutes: 45, name: "45 minutes" },
   { minutes: 50, name: "50 minutes" },
   { minutes: 55, name: "55 minutes" },
   { minutes: 60, name: "1 hour" },
   { minutes: 65, name: "1 hour 5 minutes" },
   { minutes: 70, name: "1 hour 10 minutes" },
   { minutes: 75, name: "1 hour 15 minutes" },
   { minutes: 80, name: "1 hour 20 minutes" },
   { minutes: 85, name: "1 hour 25 minutes" },
   { minutes: 90, name: "1 hour 30 minutes" },
   { minutes: 95, name: "1 hour 35 minutes" },
   { minutes: 100, name: "1 hour 40 minutes" },
   { minutes: 105, name: "1 hour 45 minutes" },
   { minutes: 110, name: "1 hour 50 minutes" },
   { minutes: 115, name: "1 hour 55 minutes" },
   { minutes: 120, name: "2 hours" },
   { minutes: 125, name: "2 hours 5 minutes" },
   { minutes: 130, name: "2 hours 10 minutes" },
   { minutes: 135, name: "2 hours 15 minutes" },
   { minutes: 140, name: "2 hours 20 minutes" },
   { minutes: 145, name: "2 hours 25 minutes" },
   { minutes: 150, name: "2 hours 30 minutes" },
   { minutes: 155, name: "2 hours 35 minutes" },
   { minutes: 160, name: "2 hours 40 minutes" },
   { minutes: 165, name: "2 hours 45 minutes" },
   { minutes: 170, name: "2 hours 50 minutes" },
   { minutes: 175, name: "2 hours 55 minutes" },
   { minutes: 180, name: "3 hours" },
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
      appearAfter: yup.number().required("Required"),
   })

export type LivestreamCreator = Creator & { originalId: Identifiable["id"] }
