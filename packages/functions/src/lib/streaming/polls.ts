import functions = require("firebase-functions")
import {
   CreateLivestreamPollRequest,
   DeleteLivestreamPollRequest,
   LivestreamEvent,
   LivestreamPoll,
   UpdateLivestreamPollRequest,
   basePollSchema,
} from "@careerfairy/shared-lib/livestreams"
import * as yup from "yup"
import config from "../../config"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"
import { livestreamsRepo } from "../../api/repositories"
import { v4 as uuid } from "uuid"

const createPollSchema: yup.SchemaOf<CreateLivestreamPollRequest> =
   basePollSchema.concat(
      yup.object({
         livestreamId: yup.string().required(),
         livestreamToken: yup.string().nullable(),
      })
   )

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

const editPollSchema: yup.SchemaOf<UpdateLivestreamPollRequest> =
   basePollSchema.concat(
      yup.object({
         livestreamId: yup.string().required(),
         livestreamToken: yup.string().nullable(),
         pollId: yup.string().required(),
         state: yup
            .mixed<LivestreamPoll["state"]>()
            .oneOf(["closed", "current", "upcoming"]),
      })
   )

export const editPoll = functions.region(config.region).https.onCall(
   middlewares<Context, UpdateLivestreamPollRequest>(
      dataValidation(editPollSchema),
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

         const optionsWithIds = options.map((o) => ({
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
      }
   )
)

const deletePollSchema: yup.SchemaOf<DeleteLivestreamPollRequest> = yup.object({
   pollId: yup.string().required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
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
