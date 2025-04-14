import functions = require("firebase-functions")
import {
   LivestreamEvent,
   MarkLivestreamQuestionAsCurrentRequest,
   MarkLivestreamQuestionAsDoneRequest,
   ResetLivestreamQuestionRequest,
} from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"

const markQuestionAsCurrentSchema: yup.SchemaOf<MarkLivestreamQuestionAsCurrentRequest> =
   yup.object({
      questionId: yup.string().required(),
      livestreamId: yup.string().required(),
      livestreamToken: yup.string().nullable(),
   })

const markQuestionAsDoneSchema: yup.SchemaOf<MarkLivestreamQuestionAsDoneRequest> =
   yup.object({
      questionId: yup.string().required(),
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

export const markQuestionAsCurrent = onCall(
   middlewares<Context & MarkLivestreamQuestionAsCurrentRequest>(
      dataValidation(markQuestionAsCurrentSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, questionId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Marking question as current", {
            livestreamId,
            questionId,
         })

         await livestreamsRepo.answerQuestion(livestreamId, questionId)

         functions.logger.info("Question marked as current", {
            livestreamId,
         })
      }
   )
)

export const markQuestionAsDone = onCall(
   middlewares<Context & MarkLivestreamQuestionAsDoneRequest>(
      dataValidation(markQuestionAsDoneSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, questionId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Marking question as done", {
            livestreamId,
            questionId,
         })

         await livestreamsRepo.markQuestionAsDone(livestreamId, questionId)

         functions.logger.info("Question marked as done", {
            livestreamId,
            questionId,
         })
      }
   )
)

export const resetQuestion = onCall(
   middlewares<Context & ResetLivestreamQuestionRequest>(
      dataValidation(resetQuestionSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, questionId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
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
