import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export const useLiveStreamsByIds = (ids: string[]) => {
   const firestore = useFirestore()

   const fetchStreams = async (): Promise<LivestreamEvent[]> => {
      if (!ids.length) return []
      const querySnapshot = await getDocs(
         query(
            collection(firestore, "livestreams"),
            where("id", "in", ids)
         ).withConverter(createGenericConverter<LivestreamEvent>())
      )
      return querySnapshot.docs.map((doc) => doc.data() as LivestreamEvent)
   }

   const { data, isLoading, isValidating, error } = useSWR<LivestreamEvent[]>(
      `get-livestreams-${ids.sort().join("-")}`,
      fetchStreams,
      {
         ...reducedRemoteCallsOptions,
         onError: (error) => {
            errorLogAndNotify(error, {
               message: "Error fetching university periods by ids and start",
               details: {
                  ids,
               },
            })
         },
      }
   )

   return {
      data,
      isLoading,
      isValidating,
      error,
   }
}
