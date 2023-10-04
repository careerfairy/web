import { useMemo } from "react"
import useSWR from "swr"
import {
   BigQueryUserQueryOptions,
   BigQueryUserResponse,
} from "@careerfairy/shared-lib/dist/bigQuery/types"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "components/custom-hook/utils/useFunctionsSWRFetcher"

export type UserRecord = {
   firstName: string
   lastName: string
   userEmail: string
   id: string
   unsubscribed: boolean
   fieldOfStudyName: string
   fieldOfStudyId: string
   levelOfStudyName: string
   levelOfStudyId: string
   universityCountryCode: string
   countriesOfInterest: string
   universityCode: string
   universityName: string
   linkedinUrl: string
   totalHits: number
   lastActivityAt: Date
}

const config = {
   ...reducedRemoteCallsOptions,
   suspense: false,
}

const useUserRecords = (options: BigQueryUserQueryOptions) => {
   const fetcher = useFunctionsSWRFetcher<BigQueryUserResponse[]>()

   const { data, isValidating } = useSWR<BigQueryUserResponse[]>(
      ["getBigQueryUsers_v2", options],
      fetcher,
      config
   )

   return useMemo(() => {
      return { users: parseUsers(data), isValidating }
   }, [data, isValidating])
}

const parseUsers = (users: BigQueryUserResponse[]): UserRecord[] => {
   if (!users) return []
   return users.map((user) => ({
      ...user,
      lastActivityAt: new Date(user.lastActivityAt.value),
   }))
}

export default useUserRecords
