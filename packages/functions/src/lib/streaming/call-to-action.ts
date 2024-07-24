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
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import config from "../../config"
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

export const createCTA = functions.region(config.region).https.onCall(
   middlewares<Context, CreateLivestreamCTARequest>(
      dataValidation(createCTASchema),
      livestreamExists(),
      async (requestData, context) => {
         const {
            livestreamId,
            livestreamToken,
            message,
            buttonText,
            buttonURL,
         } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
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

export const updateCTA = functions.region(config.region).https.onCall(
   middlewares<Context, UpdateLivestreamCTARequest>(
      dataValidation(updateCTASchema),
      livestreamExists(),
      async (requestData, context) => {
         const {
            livestreamId,
            livestreamToken,
            message,
            buttonText,
            buttonURL,
            ctaId,
         } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
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

export const toggleActiveCTA = functions.region(config.region).https.onCall(
   middlewares<Context, ToggleActiveCTARequest>(
      dataValidation(toggleActiveCTASchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken, ctaId } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
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

export const deleteCTA = functions.region(config.region).https.onCall(
   middlewares<Context, DeleteLivestreamCTARequest>(
      dataValidation(deleteCTASchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken, ctaId } = requestData

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
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
