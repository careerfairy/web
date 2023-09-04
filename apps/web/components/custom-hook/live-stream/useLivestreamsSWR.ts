import {
   createGenericConverter,
   removeDuplicateDocuments,
} from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import {
   QueryConstraint,
   QuerySnapshot,
   collection,
   getDocs,
   limit as limitQuery,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { useMemo } from "react"

import useSWR from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"
import useTraceUpdate from "../utils/useTraceUpdate"

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
         q = query(q, where("start", ">", now), orderBy("start", "asc"))
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

   const complexQueries: QueryConstraint[] = []

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

   let queries: Promise<QuerySnapshot<LivestreamEvent>>[] = []

   if (complexQueries.length > 0) {
      // For each complex query, we need to create a new query
      queries = complexQueries.map((complexQuery) => {
         return getDocs(query(q, complexQuery))
      })
   } else {
      queries = [getDocs(q)]
   }

   const results = await Promise.all(queries)

   const livestreams = results.flatMap((result) =>
      result.docs.map((doc) => doc.data())
   )

   // Remove duplicates from the multiple queries
   const deDupedLivestreams = removeDuplicateDocuments(livestreams)

   let res = new LivestreamsDataParser(deDupedLivestreams)

   /**
    * Filter by complex queries on client side
    */

   if (companyCountries?.length) {
      res = res.filterByCompanyCountry(companyCountries)
   }

   if (companyIndustries?.length) {
      res = res.filterByCompanyIndustry(companyIndustries)
   }

   if (targetFieldsOfStudy?.length) {
      res = res.filterByTargetFieldsOfStudy(targetFieldsOfStudy)
   }

   if (languageCodes?.length) {
      res = res.filterByLanguages(languageCodes)
   }

   return {
      // if any of the queries has more than the limit, then there are more to fetch
      hasMore: results.some((result) => result.size > limit),
      livestreams: res.complementaryFields().get(),
   }
}

const useLivestreamsSWR = (
   options: UseLivestreamsSWROptions = {
      type: "upcomingEvents",
   }
) => {
   useTraceUpdate(options)

   const key = useMemo(
      () => (options.disabled ? null : JSON.stringify(options)),
      [options]
   )

   return useSWR(key, () => fetcher(options), {
      ...reducedRemoteCallsOptions,
      keepPreviousData: true,
      suspense: false,
   })
}

export default useLivestreamsSWR
