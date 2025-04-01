import functions = require("firebase-functions")
import {
   LivestreamEvent,
   ToggleHandRaiseRequest,
} from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"

const toggleHandRaiseSchema: yup.SchemaOf<ToggleHandRaiseRequest> = yup.object({
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
})

type Context = {
   livestream: LivestreamEvent
}

export const toggleHandRaise = onCall(
   middlewares<Context & ToggleHandRaiseRequest>(
      dataValidation(toggleHandRaiseSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken } = request.data

         const livestream = request.middlewares.livestream

         await validateLivestreamToken(
            request.auth?.token?.email,
            livestream,
            livestreamToken
         )

         functions.logger.info("Toggling hand raise", {
            livestreamId,
         })

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
