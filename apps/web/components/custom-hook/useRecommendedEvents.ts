import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import { collection, query, where } from "firebase/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

type Config = {
   limit: FirebaseInArrayLimit
}

const useRecommendedEvents = (
   config: Config = {
      limit: 10,
   }
) => {
   const firestore = useFirestore()
   const fetcher = useFunctionsSWR<string[]>()
   const eventIds = []
   const { data: eventIdsasd } = useSWR<string[]>(
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
            where("id", "in", eventIds)
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
