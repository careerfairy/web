import useSWR from "swr"
import { useMemo } from "react"
import { FilterCompanyOptions, Group } from "@careerfairy/shared-lib/groups"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

type Result = {
   companies: Group[]
}

const companiesReducedCallsOptions = {
   ...reducedRemoteCallsOptions,
   suspense: false,
}
const useCompaniesSWR = (options?: FilterCompanyOptions): Result => {
   const fetcher = useFunctionsSWR<Group[]>()

   const { data } = useSWR(
      ["fetchCompanies", options],
      fetcher,
      companiesReducedCallsOptions
   )

   return useMemo(() => {
      const companies = (data?.length && data) || []
      return {
         companies,
      }
   }, [data])
}

export default useCompaniesSWR
