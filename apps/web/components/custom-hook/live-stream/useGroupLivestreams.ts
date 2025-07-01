import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   UPCOMING_STREAM_GRACE_PERIOD_MILLISECONDS,
   UPCOMING_STREAM_THRESHOLD_MILLISECONDS,
} from "@careerfairy/shared-lib/livestreams/constants"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { START_DATE_FOR_REPORTED_EVENTS } from "data/constants/streamContants"
import {
   collection,
   getDocs,
   orderBy,
   query,
   QuerySnapshot,
   where,
} from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

type StreamType = "upcoming" | "past" | "draft"

export const useGroupLivestreams = (groupId: string, type: StreamType) => {
   const firestore = useFirestore()

   const fetchStreams = async (): Promise<LivestreamEvent[]> => {
      if (!groupId) return []

      let querySnapshot: QuerySnapshot<LivestreamEvent>

      switch (type) {
         case "upcoming": {
            querySnapshot = await getDocs(
               query(
                  collection(firestore, "livestreams"),
                  where("groupIds", "array-contains", groupId),
                  where("test", "==", false),
                  where(
                     "start",
                     ">",
                     new Date(
                        Date.now() - UPCOMING_STREAM_GRACE_PERIOD_MILLISECONDS
                     )
                  ),
                  orderBy("start", "asc")
               ).withConverter(createGenericConverter<LivestreamEvent>())
            )
            break
         }

         case "past": {
            querySnapshot = await getDocs(
               query(
                  collection(firestore, "livestreams"),
                  where("test", "==", false),
                  where("groupIds", "array-contains", groupId),
                  where(
                     "start",
                     "<",
                     new Date(
                        Date.now() - UPCOMING_STREAM_THRESHOLD_MILLISECONDS
                     )
                  ),
                  where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS)),
                  orderBy("start", "desc")
               ).withConverter(createGenericConverter<LivestreamEvent>())
            )
            break
         }

         case "draft": {
            querySnapshot = await getDocs(
               query(
                  collection(firestore, "draftLivestreams"),
                  where("groupIds", "array-contains", groupId),
                  orderBy("start", "asc")
               ).withConverter(createGenericConverter<LivestreamEvent>())
            )
            break
         }

         default:
            throw new Error(`Unknown stream type: ${type}`)
      }

      return querySnapshot.docs.map((doc) => ({
         id: doc.id,
         rowId: doc.id,
         rowID: doc.id,
         date: doc.data().start?.toDate?.(),
         ...doc.data(),
         isDraft: type === "draft",
      }))
   }

   return useSWR<LivestreamEvent[]>(
      groupId ? `${type}-livestreams-${groupId}` : null,
      fetchStreams,
      {
         ...reducedRemoteCallsOptions,
         onError: (error) => {
            errorLogAndNotify(error, {
               title: `Error fetching ${type} livestreams`,
               details: { groupId, type },
            })
         },
      }
   )
}
