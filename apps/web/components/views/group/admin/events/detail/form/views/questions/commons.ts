import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import {
   EventRating,
   LivestreamGroupQuestions,
} from "@careerfairy/shared-lib/livestreams"
import * as yup from "yup"
import { LivestreamFormGeneralTabValues } from "../../types"

export enum FeedbackQuestionType {
   STAR_RATING = "star-rating",
   SENTIMENT_RATING = "sentiment-rating",
   TEXT = "free-text",
   TEXT_WITH_RATING = "free-text-with-rating",
}

export const FeedbackQuestionsLabels = {
   [FeedbackQuestionType.STAR_RATING]: "Star rating",
   [FeedbackQuestionType.SENTIMENT_RATING]: "Sentiment rating",
   [FeedbackQuestionType.TEXT]: "Written review",
   [FeedbackQuestionType.TEXT_WITH_RATING]: "Written review + Rating",
}

export type FeedbackQuestionFormValues = {
   question: string
   type: FeedbackQuestionType | null
   appearAfter: number
   isNew?: boolean
   deleted?: boolean
} & Identifiable

export const getNewQuestionFormValues = (): FeedbackQuestionFormValues => {
   return {
      id: undefined,
      question: undefined,
      type: undefined,
      appearAfter: undefined,
      isNew: true,
   }
}

export type RegistrationQuestionFormValues = Omit<
   LivestreamGroupQuestions,
   "questions"
> &
   GroupQuestion

export const feedbackQuestionFormInitialValues: FeedbackQuestionFormValues[] = [
   {
      id: undefined,
      question: "How happy are you with the content shared by us?",
      type: FeedbackQuestionType.STAR_RATING,
      appearAfter: 30,
   },
   {
      id: undefined,
      question:
         "Help us to improve: How can they make the experience more useful to you and other students?",
      type: FeedbackQuestionType.TEXT,
      appearAfter: 40,
   },
]

type EventRatingWithType = EventRating & { type?: FeedbackQuestionType }

export const mapRatingToFeedbackQuestions = (
   rating: EventRatingWithType
): FeedbackQuestionFormValues => {
   const result: FeedbackQuestionFormValues = {
      id: rating.id,
      question: rating.question,
      appearAfter: rating.appearAfter,
      type: undefined,
   }

   if (rating.type) {
      result.type = rating.type
      return result
   }

   // This takes care of legacy feedback questions aka ratings
   if (!rating.noStars) {
      result.type = FeedbackQuestionType.STAR_RATING
   }
   if (rating.isSentimentRating) {
      result.type = FeedbackQuestionType.SENTIMENT_RATING
   }
   if (rating.hasText && !rating.noStars) {
      result.type = FeedbackQuestionType.TEXT_WITH_RATING
   }
   if (rating.hasText && rating.noStars) {
      result.type = FeedbackQuestionType.TEXT
   }

   return result
}

export const mapFeedbackQuestionToRatings = (
   question: FeedbackQuestionFormValues,
   livestreamDuration: LivestreamFormGeneralTabValues["duration"]
): EventRatingWithType => {
   return {
      id: question.id,
      question: question.question,
      appearAfter: question.appearAfter,
      type: question.type,
      isForEnd: question.appearAfter >= livestreamDuration,
      // This is for legacy feedback questions aka ratings
      hasText:
         question.type === FeedbackQuestionType.TEXT ||
         question.type === FeedbackQuestionType.TEXT_WITH_RATING,
      noStars: question.type === FeedbackQuestionType.TEXT,
      isSentimentRating:
         question.type === FeedbackQuestionType.SENTIMENT_RATING,
   }
}

export const feedbackQuestionValidationSchema = () =>
   yup.object().shape({
      question: yup.string().required("Required"),
      type: yup.string().required("Required"),
      appearAfter: yup.number().required("Required"),
   })
