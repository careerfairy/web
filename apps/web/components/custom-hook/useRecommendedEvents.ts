import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { collection, query, where } from "firebase/firestore"
import { useEffect, useMemo } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import useSWR, { preload } from "swr"
import { useAuth } from "../../HOCs/AuthProvider"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"

type Config = {
   limit: FirebaseInArrayLimit
}

const functionName = "getRecommendedEvents_v2"
const useRecommendedEvents = (
   config: Config = {
      limit: 10,
   }
) => {
   const firestore = useFirestore()
   const fetcher = useFunctionsSWR<string[]>()
   const { authenticatedUser } = useAuth()

   const { data: eventIds } = useSWR<string[]>(
      [
         functionName,
         {
            limit: config.limit,
         },
      ],
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )

   const collectionRef = useMemo(
      () =>
         query(
            collection(firestore, "livestreams"),
            // query method does not accept where() clauses with an empty array, it will throw an error, so we provide an initial value that will be filtered out
            where("id", "in", eventIds?.length > 0 ? eventIds : [""])
         ),
      [eventIds, firestore]
   )

   const { data: events, status } = useFirestoreCollectionData<LivestreamEvent>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionRef as any,
      {
         idField: "id",
         suspense: false,
      }
   )

   const filteredEvents = filterRegisteredOrPastEvents(
      authenticatedUser?.email,
      events || []
   )

   //TODO: memoise
   const sortedEvents = [...filteredEvents].sort(
      (baseEvent, comparisonEvent) => {
         return (
            eventIds.indexOf(baseEvent.id) -
            eventIds.indexOf(comparisonEvent.id)
         )
      }
   )

   return useMemo(
      () => ({
         events: sortedEvents,
         loading: status === "loading",
      }),
      [status, sortedEvents]
   )
}

/**
 * Filter events that the user has registered for or that have already occurred
 */
const filterRegisteredOrPastEvents = (
   userId: string,
   events: LivestreamEvent[]
): LivestreamEvent[] =>
   events.filter(
      (event) => !(event.hasEnded || event.registeredUsers?.includes(userId))
   )

/*
 * Hook to preload the recommended eventIds and store them in the SWR cache
 * */
export const usePreFetchRecommendedEvents = (
   config: Config = {
      limit: 10,
   }
) => {
   const { isLoggedIn } = useAuth()

   const fetcher = useFunctionsSWR<string[]>()

   useEffect(() => {
      // Only preload if the user is logged in, otherwise the function will throw a not authed error
      if (isLoggedIn) {
         preload(
            [
               functionName,
               {
                  limit: config.limit,
               },
            ],
            fetcher
         )
      }
   }, [config.limit, fetcher, isLoggedIn])

   return null
}

export default useRecommendedEvents
