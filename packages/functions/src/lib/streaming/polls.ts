import functions = require("firebase-functions")
import {
   CreateLivestreamPollRequest,
   DeleteLivestreamPollRequest,
   LivestreamEvent,
   MarkLivestreamPollAsCurrentRequest,
   UpdateLivestreamPollRequest,
   basePollShape,
} from "@careerfairy/shared-lib/livestreams"
import * as yup from "yup"
import config from "../../config"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"
import { livestreamsRepo } from "../../api/repositories"
import { v4 as uuid } from "uuid"

const createPollSchema: yup.SchemaOf<CreateLivestreamPollRequest> = yup.object({
   options: basePollShape.options.required(),
   question: basePollShape.question.required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
})

type Context = {
   livestream: LivestreamEvent
}

export const createPoll = functions.region(config.region).https.onCall(
   middlewares<Context, CreateLivestreamPollRequest>(
      dataValidation(createPollSchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken, options, question } =
            requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Creating poll", {
            livestreamId,
            options,
            question,
         })

         await livestreamsRepo.createPoll(
            livestreamId,
            options.map((o) => ({ ...o, id: uuid() })),
            question
         )

         functions.logger.info("Poll created", {
            livestreamId,
         })
      }
   )
)

const updatePollSchema: yup.SchemaOf<UpdateLivestreamPollRequest> = yup.object({
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
   pollId: yup.string().required(),
   state: basePollShape.state.notRequired(),
   options: basePollShape.options.notRequired(),
   question: basePollShape.question.notRequired(),
})

export const updatePoll = functions.region(config.region).https.onCall(
   middlewares<Context, UpdateLivestreamPollRequest>(
      dataValidation(updatePollSchema),
      livestreamExists(),
      async (requestData, context) => {
         const {
            livestreamId,
            livestreamToken,
            options,
            question,
            pollId,
            state,
         } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
            livestreamToken
         )
         functions.logger.info("Updating poll", {
            livestreamId,
            pollId,
            options,
            question,
            state,
         })

         const optionsWithIds = options?.map((o) => ({
            ...o,
            id: o.id || uuid(),
         }))

         await livestreamsRepo.updatePoll(livestreamId, pollId, {
            options: optionsWithIds,
            question,
            state,
         })

         functions.logger.info("Poll updated", {
            livestreamId,
            pollId,
         })

         return {
            success: true,
         }
      }
   )
)

const markPollAsCurrentSchema: yup.SchemaOf<MarkLivestreamPollAsCurrentRequest> =
   yup.object({
      pollId: yup.string().required(),
      livestreamId: yup.string().required(),
      livestreamToken: yup.string(),
   })

export const markPollAsCurrent = functions.region(config.region).https.onCall(
   middlewares<Context, MarkLivestreamPollAsCurrentRequest>(
      dataValidation(markPollAsCurrentSchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken, pollId } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Marking poll as current", {
            livestreamId,
            pollId,
         })

         await livestreamsRepo.markPollAsCurrent(livestreamId, pollId)

         functions.logger.info("Poll marked as current", {
            livestreamId,
            pollId,
         })
      }
   )
)

const deletePollSchema: yup.SchemaOf<DeleteLivestreamPollRequest> = yup.object({
   pollId: yup.string().required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string(),
})

export const deletePoll = functions.region(config.region).https.onCall(
   middlewares<Context, DeleteLivestreamPollRequest>(
      dataValidation(deletePollSchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken, pollId } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Deleting poll", {
            livestreamId,
            pollId,
         })

         await livestreamsRepo.deletePoll(livestreamId, pollId)

         functions.logger.info("Poll deleted", {
            livestreamId,
            pollId,
         })
      }
   )
)
