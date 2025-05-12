import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { UserData } from "@careerfairy/shared-lib/users/users"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import useUserCountryCode from "../useUserCountryCode"
import useCustomJobs from "./useCustomJobs"

type Options = {
   disabled?: boolean
}

/**
 * Fetches the custom jobs according to the specified options. If there is an user then his businessFunctionsTagIds will be used for retrieving
 * the first batch of custom jobs which appear first.
 * @param batchSize Total number of items per batch to be sliced.
 **/
export const useCustomJobsByUser = (options: Options = {}) => {
   const { userData } = useAuth()
   const { userCountryCode, isLoading: isLoadingUserCountryCode } =
      useUserCountryCode()

   const businessFunctions = userData?.businessFunctionsTagIds || []

   // 1. Fetch all customJobs for tags if tags with limit
   const {
      customJobs: businessFunctionCustomJobs,
      isLoading: isLoadingBusinessFunctionCustomJobs,
   } = useCustomJobs({
      businessFunctionTagIds: businessFunctions,
      disabled: options.disabled,
   })

   // 2. Fetch other jobs ignoring already fetched also with limit
   const { customJobs: otherCustomJobs, isLoading: isLoadingOtherCustomJobs } =
      useCustomJobs({
         businessFunctionTagIds: [],
         ignoreIds: businessFunctionCustomJobs?.map((job) => job.id),
         disabled: options.disabled,
      })

   // 3. Concat jobs and slice according to limit
   const allCustomJobs = (businessFunctionCustomJobs || []).concat(
      otherCustomJobs || []
   )

   const sortedCustomJobs = useMemo(() => {
      return sortCustomJobs(userData, allCustomJobs, userCountryCode)
   }, [userData, allCustomJobs, userCountryCode])

   return {
      customJobs: sortedCustomJobs,
      totalCount: sortedCustomJobs.length,
      isLoading:
         isLoadingBusinessFunctionCustomJobs ||
         isLoadingOtherCustomJobs ||
         isLoadingUserCountryCode,
   }
}

const sortCustomJobs = (
   userData: UserData,
   customJobs: CustomJob[],
   userCountryCode: string
) => {
   const userCountry = userData?.countryIsoCode || userCountryCode
   const userState = userData?.stateIsoCode

   return [...customJobs].sort((a, b) => {
      // Helper function to get location priority
      const getLocationPriority = (job: CustomJob) => {
         // If no locations, lowest priority
         if (!job.jobLocation?.length) return 3

         // Check all locations for matches
         for (const location of job.jobLocation) {
            const [country, state] = location.id.split("-")

            // Exact match (country + state)
            if (country === userCountry && state === userState) return 1

            // Country match only
            if (country === userCountry) return 2
         }

         // No matches found
         return 3
      }

      const aPriority = getLocationPriority(a)
      const bPriority = getLocationPriority(b)

      // First sort by location priority
      if (aPriority !== bPriority) {
         return aPriority - bPriority
      }

      // Then sort by deadline within each location group
      return a.deadline.toMillis() - b.deadline.toMillis()
   })
}
