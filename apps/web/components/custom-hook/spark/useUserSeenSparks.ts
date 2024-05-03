import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { SeenSparks, Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"
import useSparksByIds from "./useSparksByIds"

const functionName = "getUserSeenSparks"

/**
 * TODO: Update documentation
 * @param limit
 * @returns
 */
export const useUserSeenSparks = (limit?: 20) => {
   const fetcher = useFunctionsSWR()

   const {
      data: sparks,
      error,
      isLoading,
   } = useSWR<Spark[]>(
      [
         functionName,
         {
            limit: limit,
         },
      ],
      fetcher,
      {
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: "Error Fetching user SeenSparks by IDs via function",
               key,
            }),
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )

   return useMemo(
      () => ({
         sparks: sparks,
         loading: isLoading,
         error: error,
      }),
      [error, isLoading, sparks]
   )
}
/**
 * TODO: Add documentation and error notification
 * @param userId
 * @param limitItems
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useUserSeenSparks_v1 = (userId: string, limitItems?: 20) => {
   console.log("🚀 ~ useUserSeenSparks - userId:", userId)
   const firestore = useFirestore()
   const collectionRef = useMemo(
      () =>
         query(
            collection(firestore, "seenSparks"),
            where("userId", "==", userId)
         ),
      [firestore, userId]
   )

   const {
      data: seenSparks,
      status,
      error,
   } = useFirestoreCollectionData<SeenSparks>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionRef as any,
      {
         idField: "userId",
         suspense: false,
      }
   )

   const userSeenSparks =
      (Boolean(seenSparks?.length) && seenSparks.at(0).sparks) || undefined
   const sparkIds = userSeenSparks
      ? sortSparksMapIds(userSeenSparks, limitItems)
      : []

   const {
      sparks,
      error: sparkByIdsError,
      loading: sparkByIdsLoading,
   } = useSparksByIds(sparkIds)

   if (error) {
      errorLogAndNotify(error, {
         message: "Error Fetching User seenSparks for user " + userId,
         key: "useUserSeenSparks-fetchData",
      })
   }

   return useMemo(
      () => ({
         seenSparks: sparks,
         loading: status === "loading" || sparkByIdsLoading,
         error: status === "error" || sparkByIdsError,
      }),
      [sparkByIdsError, sparkByIdsLoading, sparks, status]
   )
}

const sortSparksMapIds = (
   sparks: {
      [sparkId: string]: Timestamp
   },
   limit: number
): string[] => {
   const sortedSparks = Object.keys(sparks)
      .map((sparkId) => {
         return {
            sparkId: sparkId,
            seenTimestamp: sparks[sparkId],
         }
      })
      .sort(
         (baseSpark, comparisonSpark) =>
            baseSpark.seenTimestamp.toMillis() -
            comparisonSpark.seenTimestamp.toMillis()
      )

   return sortedSparks
      .map((sortedSpark) => sortedSpark.sparkId)
      .filter((_, idx) => idx < limit)
}

export default useUserSeenSparks
