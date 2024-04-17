import functions = require("firebase-functions")
import * as yup from "yup"
import config from "../../config"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"
import { livestreamsRepo } from "../../api/repositories"
import {
   MarkLivestreamQuestionAsCurrentRequest,
   LivestreamEvent,
   ResetLivestreamQuestionRequest,
} from "@careerfairy/shared-lib/livestreams"

const markQuestionAsCurrentSchema: yup.SchemaOf<MarkLivestreamQuestionAsCurrentRequest> =
   yup.object({
      question: yup.string().required(),
      livestreamId: yup.string().required(),
      livestreamToken: yup.string().nullable(),
   })

const resetQuestionSchema: yup.SchemaOf<ResetLivestreamQuestionRequest> =
   yup.object({
      livestreamId: yup.string().required(),
      livestreamToken: yup.string().nullable(),
      questionId: yup.string().notRequired(),
   })

type Context = {
   livestream: LivestreamEvent
}

export const markQuestionAsCurrent = functions
   .region(config.region)
   .https.onCall(
      middlewares<Context, MarkLivestreamQuestionAsCurrentRequest>(
         dataValidation(markQuestionAsCurrentSchema),
         livestreamExists(),
         async (requestData, context) => {
            const { livestreamId, livestreamToken, question } = requestData

            await validateLivestreamToken(
               context.auth?.token?.email,
               context.middlewares.livestream,
               livestreamToken
            )

            functions.logger.info("Marking question as current", {
               livestreamId,
               question,
            })

            await livestreamsRepo.answerQuestion(livestreamId, question)

            functions.logger.info("Question marked as current", {
               livestreamId,
            })
         }
      )
   )

export const resetQuestion = functions.region(config.region).https.onCall(
   middlewares<Context, ResetLivestreamQuestionRequest>(
      dataValidation(resetQuestionSchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken, questionId } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
            livestreamToken
         )

         if (questionId) {
            functions.logger.info("Resetting question", {
               livestreamId,
               questionId,
            })
            await livestreamsRepo.resetQuestion(livestreamId, questionId)

            functions.logger.info("Question reset", {
               livestreamId,
               questionId,
            })
         } else {
            functions.logger.info("Resetting all questions", {
               livestreamId,
            })
            await livestreamsRepo.resetAllQuestions(livestreamId)

            functions.logger.info("All questions reset", {
               livestreamId,
            })
         }
      }
   )
)
