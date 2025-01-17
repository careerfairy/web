import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { getCountryOptionByCountryCode } from "@careerfairy/shared-lib/constants/forms"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useAuth } from "HOCs/AuthProvider"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { sparkService } from "data/firebase/SparksService"
import {
   collection,
   getDocs,
   limit,
   orderBy,
   query,
   QuerySnapshot,
   where,
} from "firebase/firestore"
import { useEffect } from "react"
import { useLocalStorage } from "react-use"
import useSWR, { preload } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useUserCountryCode from "../useUserCountryCode"

// Constants
const SPARKS_LIMIT = 10
const STORAGE_KEY = "userCountryCode"

// Types
type FetcherParams = {
   userId?: string
   countryCode?: string
}

// Utility functions
const getKey = (userId: string, userCountryCode?: string) => {
   if (userId) {
      return `userSparks-${userId}`
   }

   const suffix = userCountryCode ? `-${userCountryCode}` : ""
   return `userSparks${suffix}`
}

// Firebase query builders
const createBaseFeedQuery = (userId: string) =>
   query(
      collection(FirestoreInstance, `userData/${userId}/sparksFeed`),
      where("group.publicSparks", "==", true),
      orderBy("publishedAt", "desc"),
      limit(SPARKS_LIMIT)
   ).withConverter<Spark>(createGenericConverter())

const createPublicSparksQuery = () =>
   query(
      collection(FirestoreInstance, "sparks"),
      where("group.publicSparks", "==", true),
      orderBy("publishedAt", "desc"),
      limit(SPARKS_LIMIT)
   ).withConverter<Spark>(createGenericConverter())

// Fetcher functions
const fetchUserFeed = async (userId: string): Promise<Spark[]> => {
   const snapshot = await getDocs(createBaseFeedQuery(userId))

   if (snapshot.empty) {
      // If the user's sparks feed is empty, we will generate one
      const { sparks } = await sparkService.fetchFeed({
         numberOfSparks: SPARKS_LIMIT,
         userId,
      })
      return sparks.map(SparkPresenter.toFirebaseObject)
   }

   return snapshot.docs.map((doc) => doc.data())
}

const fetchPublicSparks = async (countryCode?: string): Promise<Spark[]> => {
   let snapshots: QuerySnapshot<Spark>
   const baseQuery = createPublicSparksQuery()

   if (countryCode) {
      const formattedCountryCode = getCountryOptionByCountryCode(countryCode)
      const countryFilteredQuery = query(
         baseQuery,
         where(
            "group.targetedCountries",
            "array-contains",
            formattedCountryCode
         )
      )

      snapshots = await getDocs(countryFilteredQuery)

      if (snapshots.size < SPARKS_LIMIT) {
         snapshots = await getDocs(baseQuery)
      }
   } else {
      snapshots = await getDocs(baseQuery)
   }

   return snapshots.docs.map((doc) => doc.data())
}

const fetcher = async ({ userId, countryCode }: FetcherParams) => {
   if (userId) {
      return fetchUserFeed(userId)
   }
   return fetchPublicSparks(countryCode)
}

type Options = {
   suspense?: boolean
}

/**
 * Custom hook to fetch user sparks.
 * Utilizes SWR for data fetching and caching.
 *
 * @param options - Options for the hook
 * @returns Array of Spark objects
 */
export const useUserSparks = (options: Options = {}) => {
   const { authenticatedUser } = useAuth()
   const { userCountryCode } = useUserCountryCode()

   const [storedUserCountryCode, setStoredUserCountryCode] =
      useLocalStorage<string>(STORAGE_KEY, null)

   useEffect(() => {
      if (userCountryCode) {
         setStoredUserCountryCode(userCountryCode)
      }
   }, [userCountryCode, setStoredUserCountryCode])

   const key = getKey(authenticatedUser.email, storedUserCountryCode)

   const { data, isLoading } = useSWR(
      key,
      () =>
         fetcher({
            userId: authenticatedUser.email,
            countryCode: storedUserCountryCode,
         }),
      {
         suspense: options?.suspense,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error fetching user sparks",
               key,
            })
         },
      }
   )

   return { sparks: data, isLoading }
}

/**
 * Custom hook to preload user sparks before the actual hook is called which will:
 * 1. Preload the user sparks in SWR cache
 * 2. Warm up the Google Cloud Function For 15 mins
 * 3. Backfill the sparks feed for the user, if they never had one to begin with
 */
export const usePrefetchUserSparks = () => {
   const { authenticatedUser, isLoggedIn } = useAuth()

   useEffect(() => {
      if (isLoggedIn) {
         preload(getKey(authenticatedUser.email), () =>
            fetcher({ userId: authenticatedUser.email })
         )
      }
   }, [authenticatedUser.email, isLoggedIn])

   return null
}
