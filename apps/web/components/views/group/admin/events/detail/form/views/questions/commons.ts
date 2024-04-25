import * as yup from "yup"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"

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
