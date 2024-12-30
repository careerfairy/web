import { getCountryOptionByCountryCode } from "@careerfairy/shared-lib/constants/forms"
import { useAuth } from "HOCs/AuthProvider"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"

import {
   collection,
   limit,
   orderBy,
   query,
   QuerySnapshot,
   where,
} from "firebase/firestore"
import { useEffect } from "react"
import useSWR, { preload } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { sparkService } from "data/firebase/SparksService"
import { getDocs } from "firebase/firestore"
import useUserCountryCode from "../useUserCountryCode"

const SPARKS_LIMIT = 10

const getKey = (userId: string, userCountryCode?: string) =>
   userId ? `userSparks-${userId}-${userCountryCode}` : "userSparks"

const getUserCountryCode = () => {
   return localStorage.getItem("userCountryCode")
}

const fetcher = async (userId?: string) => {
   if (userId) {
      // Fetch logged-in user's sparks from their feed
      const userFeedRef = query(
         collection(FirestoreInstance, `userData/${userId}/sparksFeed`),
         where("group.publicSparks", "==", true),
         orderBy("publishedAt", "desc"),
         limit(SPARKS_LIMIT)
      ).withConverter<Spark>(createGenericConverter())

      const snapshot = await getDocs(userFeedRef)

      if (snapshot.empty) {
         // If no feed exists, call the cloud function to lazily generate a feed and return it
         const { sparks } = await sparkService.fetchFeed({
            numberOfSparks: 10,
            userId: userId || null,
         })

         return sparks.map(SparkPresenter.toFirebaseObject)
      }

      return snapshot.docs.map((doc) => doc.data())
   } else {
      // Fetch public sparks for logged-out users
      const countryCode = getUserCountryCode()
      let snapshots: QuerySnapshot<Spark>

      const queryWithoutCountryCode = query(
         collection(FirestoreInstance, "sparks"),
         where("group.publicSparks", "==", true),
         orderBy("publishedAt", "desc"),
         limit(SPARKS_LIMIT)
      ).withConverter<Spark>(createGenericConverter())

      if (countryCode) {
         const formattedCountryCode = getCountryOptionByCountryCode(countryCode)
         const queryWithCountryCode = query(
            queryWithoutCountryCode,
            where(
               "group.targetedCountries",
               "array-contains",
               formattedCountryCode
            )
         )

         snapshots = await getDocs(queryWithCountryCode)

         if (snapshots.size < SPARKS_LIMIT) {
            snapshots = await getDocs(queryWithoutCountryCode)
         }
      } else {
         snapshots = await getDocs(queryWithoutCountryCode)
      }

      const results = snapshots.docs.map((doc) => doc.data())

      return results
   }
}

/**
 * Custom hook to fetch user sparks.
 * Utilizes SWR for data fetching and caching.
 *
 * @returns SWR response object containing user sparks data.
 */
export const useUserSparks = () => {
   const { authenticatedUser, isLoggedIn } = useAuth()
   const { userCountryCode } = useUserCountryCode()

   // Store country code in localStorage when it changes
   useEffect(() => {
      if (userCountryCode) {
         localStorage.setItem("userCountryCode", userCountryCode)
      }
   }, [userCountryCode])

   const key = getKey(authenticatedUser.email, userCountryCode)

   const { data } = useSWR(key, async () => fetcher(authenticatedUser.email), {
      ...reducedRemoteCallsOptions,
      onError: (error, key) => {
         errorLogAndNotify(error, {
            message: "Error fetching user sparks",
            key,
         })
      },
   })

   const userHasEmptySparksFeed = data && data.length === 0

   useEffect(() => {
      const backfillUserSparks = async () => {
         await sparkService.fetchFeed({
            numberOfSparks: SPARKS_LIMIT,
            userId: authenticatedUser.email,
         })
      }

      if (isLoggedIn && userHasEmptySparksFeed) {
         // Trigger prefetch if user has no sparks feed
         backfillUserSparks()
      }
   }, [authenticatedUser.email, isLoggedIn, userHasEmptySparksFeed])

   return data
}

/**
 * Custom hook to preload user sparks before the actual hook is called which will:
 * 1. Preload the user sparks in SWR cache
 * 2. Warm up the Google Cloud Function For 15 mins
 * 3. Backfill the sparks feed for the user, if they never had one to begin with
 */
export const usePrefetchUserSparks = () => {
   const { authenticatedUser } = useAuth()

   useEffect(() => {
      // Only preload if the auth state has loaded
      if (authenticatedUser.isLoaded) {
         preload(getKey(authenticatedUser.email), async () =>
            fetcher(authenticatedUser.email)
         )
      }
   }, [authenticatedUser.email, authenticatedUser.isLoaded])

   return null
}
