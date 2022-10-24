import { useMemo } from "react"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import useSWR from "swr"

type SignatureResponse = {
   signature: string
   email: string
} | null

const useCrispSignature = (email?: string): SignatureResponse => {
   const fetcher = useFunctionsSWR<SignatureResponse>()

   const { data } = useSWR<SignatureResponse>(
      email
         ? [
              "getCrispSignature",
              {
                 email,
              },
           ]
         : null,
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )
   return useMemo<SignatureResponse>(() => data, [data])
}

export default useCrispSignature
