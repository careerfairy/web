import functions = require("firebase-functions")
import {
   CreateLivestreamPollRequest,
   DeleteLivestreamPollRequest,
   LivestreamEvent,
   LivestreamPoll,
   MarkLivestreamPollAsCurrentRequest,
   UpdateLivestreamPollRequest,
   basePollShape,
} from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import { v4 as uuid } from "uuid"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { logAndThrow, validateLivestreamToken } from "../validations"

const createPollSchema: yup.SchemaOf<CreateLivestreamPollRequest> = yup.object({
   options: basePollShape.options.required(),
   question: basePollShape.question.required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
})

type Context = {
   livestream: LivestreamEvent
}

export const createPoll = onCall(
   middlewares<Context & CreateLivestreamPollRequest>(
      dataValidation(createPollSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, options, question } =
            request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
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

export const updatePoll = onCall(
   middlewares<Context & UpdateLivestreamPollRequest>(
      dataValidation(updatePollSchema),
      livestreamExists(),
      async (request) => {
         const {
            livestreamId,
            livestreamToken,
            options,
            question,
            pollId,
            state,
         } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         const currentPoll = await livestreamsRepo.getPoll(livestreamId, pollId)

         if (!currentPoll) {
            logAndThrow("Poll not found", {
               pollId,
               livestreamId,
               userId: request.auth?.token?.uid,
               userEmail: request.auth?.token?.email,
            })
         }

         // validate that only the state can be changed to 'closed' or 'current'
         if (currentPoll.state !== "upcoming" && state !== "upcoming") {
            if (options || question) {
               logAndThrow(
                  "Cannot change options or question unless the state is 'upcoming'",
                  {
                     pollId,
                     livestreamId,
                     userId: request.auth?.token?.uid,
                     userEmail: request.auth?.token?.email,
                  }
               )
            }
            if (state && !["closed", "current"].includes(state)) {
               logAndThrow(
                  "State can only be updated to 'closed' or 'current'",
                  {
                     pollId,
                     livestreamId,
                     userId: request.auth?.token?.uid,
                     userEmail: request.auth?.token?.email,
                  }
               )
            }
         }

         functions.logger.info("Updating poll", {
            livestreamId,
            pollId,
            options,
            question,
            state,
         })

         const updateData: Partial<
            Pick<LivestreamPoll, "options" | "question" | "state">
         > = {}

         if (options) {
            updateData.options = options.map((o) => ({
               ...o,
               id: o.id || uuid(),
            }))
         }
         if (question) {
            updateData.question = question
         }
         if (state) {
            updateData.state = state
         }

         await livestreamsRepo.updatePoll(livestreamId, pollId, updateData)

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
      livestreamToken: yup.string().nullable(),
   })

export const markPollAsCurrent = onCall(
   middlewares<Context & MarkLivestreamPollAsCurrentRequest>(
      dataValidation(markPollAsCurrentSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, pollId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
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
   livestreamToken: yup.string().nullable(),
})

export const deletePoll = onCall(
   middlewares<Context & DeleteLivestreamPollRequest>(
      dataValidation(deletePollSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, pollId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
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
