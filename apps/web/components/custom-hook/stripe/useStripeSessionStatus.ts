import useSWR, { SWRConfiguration } from "swr"

import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useMemo } from "react"
import Stripe from "stripe"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"
import { getStripeEnvironment } from "./useStripeEnvironment"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching Stripe Session status with options: ${key}`,
      }),
}
/**
 * Stripe Session Status from API call
 */
type Result = {
   data: {
      status: Stripe.Checkout.Session.Status
      paymentStatus: Stripe.Checkout.Session.PaymentStatus
      customerEmail: string
   }
}

/**
 * Retrieves the Stripe Checkout Session status details via the redirect url session_id
 * @param sessionId Unique Stripe Session identifier
 * @returns Main details about session status
 */
const useStripeSessionStatus = (sessionId: string): Result => {
   const fetcher = useFunctionsSWR<Result[]>()
   const { group } = useGroup()
   const stripeEnv = getStripeEnvironment()
   const options = useMemo(() => {
      return {
         sessionId: sessionId,
         groupId: group.id,
      }
   }, [group.id, sessionId])
   return useSWR(
      [FUNCTION_NAMES.fetchStripeSessionStatus[stripeEnv], options],
      fetcher,
      {
         ...swrOptions,
         suspense: false,
      }
   )
}

export default useStripeSessionStatus
