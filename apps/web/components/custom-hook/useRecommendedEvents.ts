import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import { collection, query, where } from "firebase/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

type Config = {
   limit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 // Max 10 to allow firestore query to work
}

const useRecommendedEvents = (
   config: Config = {
      limit: 10,
   }
) => {
   const firestore = useFirestore()
   const fetcher = useFunctionsSWR<string[]>()

   const { data: eventIds } = useSWR<string[]>(
      [
         "getRecommendedEvents",
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
            where("id", "in", eventIds?.length ? eventIds : [""])
         ),
      [eventIds, firestore]
   )

   const { data: events, status } = useFirestoreCollectionData<LivestreamEvent>(
      collectionRef as any,
      {
         idField: "id",
         suspense: false,
      }
   )

   return useMemo(
      () => ({
         events,
         loading: status === "loading",
      }),
      [events, status]
   )
}

export default useRecommendedEvents
