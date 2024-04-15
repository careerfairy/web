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
   const options = useMemo(() => {
      return {
         priceId: priceId,
         groupId: group.id,
      }
   }, [group.id, priceId])
   return useSWR(["fetchStripePrice", options], fetcher, swrOptions)
}

export default useStripePrice
