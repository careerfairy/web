import useSWR, { SWRConfiguration } from "swr"

import { useMemo } from "react"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"
import Stripe from "stripe"
import { errorLogAndNotify } from "util/CommonUtil"
import { useGroup } from "layouts/GroupDashboardLayout"

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
   const options = useMemo(() => {
      return {
         sessionId: sessionId,
         groupId: group.id,
      }
   }, [group.id, sessionId])
   return useSWR(["fetchStripeSessionStatus", options], fetcher, swrOptions)
}

export default useStripeSessionStatus
