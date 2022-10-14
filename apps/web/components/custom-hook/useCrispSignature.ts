import { useMemo } from "react"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import useSWR from "swr"
import { useAuth } from "../../HOCs/AuthProvider"

type SignatureResponse = {
   signature: string
   email: string
} | null

const useCrispSignature = (): SignatureResponse => {
   const { authenticatedUser } = useAuth()

   const fetcher = useFunctionsSWR<SignatureResponse>()

   const { data } = useSWR<SignatureResponse>(
      authenticatedUser?.email
         ? [
              "getCrispSignature",
              {
                 email: authenticatedUser.email,
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
