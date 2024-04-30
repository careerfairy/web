import functions = require("firebase-functions")
import {
   LivestreamEvent,
   ToggleHandRaiseRequest,
} from "@careerfairy/shared-lib/livestreams"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import config from "../../config"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"

const toggleHandRaiseSchema: yup.SchemaOf<ToggleHandRaiseRequest> = yup.object({
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().required(),
})

type Context = {
   livestream: LivestreamEvent
}

export const toggleHandRaise = functions.region(config.region).https.onCall(
   middlewares<Context, ToggleHandRaiseRequest>(
      dataValidation(toggleHandRaiseSchema),
      livestreamExists(),
      async (requestData, context) => {
         const { livestreamId, livestreamToken } = requestData

         const livestream = context.middlewares.livestream

         await validateLivestreamToken(
            context.auth?.token?.email,
            context.middlewares.livestream,
            livestreamToken
         )

         functions.logger.info("Toggling hand raise", {
            livestreamId,
         })

         // Assuming there's a repository function to toggle hand raise status
         await livestreamsRepo.updateHandRaise(
            livestreamId,
            !livestream.handRaiseActive
         )

         functions.logger.info("Hand raise toggled", {
            livestreamId,
         })
      }
   )
)
