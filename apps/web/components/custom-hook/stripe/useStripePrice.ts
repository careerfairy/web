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
         message: `Error fetching Stripe prices with options: ${key}`,
      }),
}
/**
 * Stripe Price from API call
 */
type Result = {
   data: Stripe.Price
}

/**
 * Retrieves the Stripe.Price details for a given Price ID
 * @param priceId Unique Stripe Price Identifier
 * @returns Stripe.Price details
 */
const useStripePrice = (priceId: string) => {
   const fetcher = useFunctionsSWR<Result[]>()
   const { group } = useGroup()
   const stripeEnv = getStripeEnvironment()
   const options = useMemo(() => {
      return {
         priceId: priceId,
         groupId: group.id,
      }
   }, [group.id, priceId])
   return useSWR(
      [FUNCTION_NAMES.fetchStripePrice[stripeEnv], options],
      fetcher,
      {
         ...swrOptions,
         suspense: false,
         onError: (error) =>
            errorLogAndNotify(error, {
               message: `Error fetching Stripe price with options: ${options}`,
            }),
      }
   )
}

export default useStripePrice
