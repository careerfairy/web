import useSWR from "swr"
import { useMemo } from "react"
import { FilterCompanyOptions, Group } from "@careerfairy/shared-lib/groups"
import useFunctionsSWR from "../utils/useFunctionsSWRFetcher"

type Result = {
   companies: Group[]
}

const useCompaniesSWR = (options?: FilterCompanyOptions): Result => {
   const fetcher = useFunctionsSWR<Group[]>()

   const { data } = useSWR(["fetchCompanies", options], fetcher)

   return useMemo(() => {
      const companies = (data?.length && data) || []
      return {
         companies,
      }
   }, [data])
}

export default useCompaniesSWR
