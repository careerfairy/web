import functions = require("firebase-functions")
import {
   CreateLivestreamCTARequest,
   DeleteLivestreamCTARequest,
   LivestreamCTA,
   LivestreamEvent,
   ToggleActiveCTARequest,
   UpdateLivestreamCTARequest,
   baseCTAShape,
} from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateCTAExists, validateLivestreamToken } from "../validations"

const createCTASchema: yup.SchemaOf<CreateLivestreamCTARequest> = yup.object({
   message: baseCTAShape.message.required(),
   buttonText: baseCTAShape.buttonText.required(),
   buttonURL: baseCTAShape.buttonURL.required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
})

type Context = {
   livestream: LivestreamEvent
}

export const createCTA = onCall(
   middlewares<Context & CreateLivestreamCTARequest>(
      dataValidation(createCTASchema),
      livestreamExists(),
      async (request) => {
         const {
            livestreamId,
            livestreamToken,
            message,
            buttonText,
            buttonURL,
         } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Creating CTA", {
            livestreamId,
            message,
            buttonURL,
         })

         await livestreamsRepo.createCTA(
            livestreamId,
            message,
            buttonText,
            buttonURL
         )

         functions.logger.info("CTA created", {
            livestreamId,
         })
      }
   )
)

const updateCTASchema: yup.SchemaOf<UpdateLivestreamCTARequest> = yup.object({
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
   ctaId: yup.string().required(),
   message: baseCTAShape.message.notRequired(),
   buttonText: baseCTAShape.buttonText.notRequired(),
   buttonURL: baseCTAShape.buttonURL.notRequired(),
})

export const updateCTA = onCall(
   middlewares<Context & UpdateLivestreamCTARequest>(
      dataValidation(updateCTASchema),
      livestreamExists(),
      async (request) => {
         const {
            livestreamId,
            livestreamToken,
            message,
            buttonText,
            buttonURL,
            ctaId,
         } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         await validateCTAExists(livestreamId, ctaId)

         functions.logger.info("Updating CTA", {
            livestreamId,
            ctaId,
            message,
            buttonText,
            buttonURL,
         })

         const updateData: Partial<
            Pick<LivestreamCTA, "message" | "buttonText" | "buttonURL">
         > = {}

         if (message) {
            updateData.message = message
         }
         if (buttonText) {
            updateData.buttonText = buttonText
         }
         if (buttonURL) {
            updateData.buttonURL = buttonURL
         }

         await livestreamsRepo.updateCTA(livestreamId, ctaId, updateData)

         functions.logger.info("CTA updated", {
            livestreamId,
            ctaId,
         })

         return {
            success: true,
         }
      }
   )
)

const toggleActiveCTASchema: yup.SchemaOf<ToggleActiveCTARequest> = yup.object({
   ctaId: yup.string().required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
})

export const toggleActiveCTA = onCall(
   middlewares<Context & ToggleActiveCTARequest>(
      dataValidation(toggleActiveCTASchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, ctaId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         await validateCTAExists(livestreamId, ctaId)

         functions.logger.info("Toggling active CTA", {
            livestreamId,
            ctaId,
         })

         await livestreamsRepo.toggleActiveCTA(livestreamId, ctaId)

         functions.logger.info("CTA toggled", {
            livestreamId,
            ctaId,
         })
      }
   )
)

const deleteCTASchema: yup.SchemaOf<DeleteLivestreamCTARequest> = yup.object({
   ctaId: yup.string().required(),
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
})

export const deleteCTA = onCall(
   middlewares<Context & DeleteLivestreamCTARequest>(
      dataValidation(deleteCTASchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, ctaId } = request.data

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares.livestream,
            livestreamToken
         )

         await validateCTAExists(livestreamId, ctaId)

         functions.logger.info("Deleting CTA", {
            livestreamId,
            ctaId,
         })

         await livestreamsRepo.deleteCTA(livestreamId, ctaId)

         functions.logger.info("CTA deleted", {
            livestreamId,
            ctaId,
         })
      }
   )
)
