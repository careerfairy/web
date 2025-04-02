import functions = require("firebase-functions")
import { RuntimeOptions } from "firebase-functions"
import { getChangeTypes } from "../../util"

export const defaultTriggerRunTimeConfig: RuntimeOptions = {
   // Ensure that the function has enough time to finish all side effects
   timeoutSeconds: 540, // 9 minutes (max)
   /*
    * 256 MB (default) to 8 GB (max) pricing can be found here: https://cloud.google.com/functions/pricing#compute_time
    * */
   memory: "256MB",
}

export const defaultTriggerRunTimeConfigV2 = {
   // Ensure that the function has enough time to finish all side effects
   timeoutSeconds: 540, // 9 minutes (max)
   /*
    * 256 MB (default) to 8 GB (max) pricing can be found here: https://cloud.google.com/functions/pricing#compute_time
    * */
   memory: "256MiB",
} as const

export const handleSideEffects = (sideEffectPromises: Promise<unknown>[]) => {
   return Promise.allSettled(sideEffectPromises).then((results) => {
      results.forEach((result) => {
         if (result.status === "rejected") {
            functions.logger.error(result.reason)
         }
      })
   })
}

export const logStart = ({
   message,
   context,
   changeTypes,
}: {
   message: string
   context: Pick<functions.EventContext, "params">
   changeTypes: ReturnType<typeof getChangeTypes>
}) => {
   functions.logger.info(message, {
      changeTypes,
      params: context.params,
   })
}
