import {
   Change,
   DocumentSnapshot,
   FirestoreEvent,
} from "firebase-functions/firestore"
import { GlobalOptions } from "firebase-functions/options"
import { logger } from "firebase-functions/v2"
import { getChangeTypes } from "../../util"

export const defaultTriggerRunTimeConfig: GlobalOptions = {
   // Ensure that the function has enough time to finish all side effects
   timeoutSeconds: 540, // 9 minutes (max)
   /*
    * 256 MB (default) to 8 GB (max) pricing can be found here: https://cloud.google.com/functions/pricing#compute_time
    * */
   memory: "256MiB",
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
            logger.error(result.reason)
         }
      })
   })
}

export const logStart = ({
   message,
   event,
   changeTypes,
}: {
   message: string
   event: FirestoreEvent<Change<DocumentSnapshot>>
   changeTypes: ReturnType<typeof getChangeTypes>
}) => {
   logger.info(message, {
      changeTypes,
      params: event.params,
   })
}
