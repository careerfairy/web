import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import {
   LivestreamEvent,
   getEarliestEventBufferTime,
} from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import {
   QueryFilterConstraint,
   collection,
   getDocs,
   limit as limitQuery,
   or,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { useCallback, useMemo } from "react"

import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const now = new Date()

export type UseLivestreamsSWROptions = {
   languageCodes?: string[]
   companyIndustries?: string[]
   companyCountries?: string[]
   targetFieldsOfStudy?: FieldOfStudy[]
   withRecordings?: boolean
   withTest?: boolean
   withHidden?: boolean
   limit?: number
   targetGroupIds?: string[]
   type: "pastEvents" | "upcomingEvents"
   disabled?: boolean
}

const fetcher = async (options: UseLivestreamsSWROptions) => {
   const {
      limit = 20,
      type,
      targetGroupIds,
      withRecordings,
      withTest,
      withHidden,
      companyIndustries,
      companyCountries,
      targetFieldsOfStudy,
      languageCodes,
   } = options

   let q = query(collection(FirestoreInstance, "livestreams")).withConverter(
      createGenericConverter<LivestreamEvent>()
   )

   if (targetGroupIds?.length > 0) {
      q = query(q, where("groupIds", "array-contains-any", targetGroupIds))
   } else {
      if (type === "pastEvents") {
         q = query(q, where("start", "<", now), orderBy("start", "desc"))
      } else {
         q = query(
            q,
            where("start", ">", getEarliestEventBufferTime()),
            orderBy("start", "asc")
         )
      }

      if (withRecordings) {
         q = query(q, where("denyRecordingAccess", "==", false))
      }

      if (!withTest) {
         q = query(q, where("test", "==", false))
      }

      if (!withHidden) {
         q = query(q, where("hidden", "==", false))
      }
   }

   q = query(q, limitQuery(limit + 1)) // +1 to check if there are more events

   const complexQueries: QueryFilterConstraint[] = []

   if (companyIndustries?.length > 0) {
      complexQueries.push(
         where("companyIndustries", "array-contains-any", companyIndustries)
      )
   }

   if (companyCountries?.length > 0) {
      complexQueries.push(
         where("companyCountries", "array-contains-any", companyCountries)
      )
   }

   if (targetFieldsOfStudy?.length > 0) {
      complexQueries.push(
         where("targetFieldsOfStudy", "array-contains-any", targetFieldsOfStudy)
      )
   }

   if (languageCodes?.length > 0) {
      complexQueries.push(where("language.code", "in", languageCodes))
   }

   if (complexQueries.length > 0) {
      // If any complex queries were added, combine them using logical OR
      // This allows for fetching documents that meet any of the complex conditions
      // As per Firestore limitations, note that only a maximum of 30 disjunctions aka companyCountries/targetFieldsOfStudy/languageCodes/companyIndustries can be applied
      q = query(q, or(...complexQueries))
   }

   const snaps = await getDocs(q)

   const livestreams = snaps.docs.map((doc) => doc.data())

   return {
      hasMore: snaps.size > limit,
      livestreams,
   }
}

const useLivestreamsSWR = (
   options: UseLivestreamsSWROptions = {
      type: "upcomingEvents",
   }
) => {
   const key = useMemo(
      () => (options.disabled ? null : JSON.stringify(options)),
      [options]
   )

   const swrFetcher = useCallback(() => fetcher(options), [options])

   return useSWR(key, swrFetcher, swrOptions)
}

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: false,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestreams with options: ${key}`,
      }),
}

export default useLivestreamsSWR
