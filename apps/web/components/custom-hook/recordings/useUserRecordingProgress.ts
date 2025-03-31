import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { RecordingStatsUser } from "@careerfairy/shared-lib/livestreams"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export const useUserRecordingProgress = (
   livestreamId?: string,
   userId?: string
) => {
   const firestore = useFirestore()

   const fetchStreams = async (): Promise<{
      lastSecondWatched: number
   }> => {
      if (!livestreamId || !userId) return null

      const recordingStatsUserRef = collection(
         firestore,
         "livestreams",
         livestreamId,
         "recordingStatsUser"
      )

      const recordingStatsUserQuery = query(
         recordingStatsUserRef,
         where("userId", "==", userId)
      ).withConverter(createGenericConverter<RecordingStatsUser>())

      const querySnapshot = await getDocs(recordingStatsUserQuery)

      const lastSecondWatched = querySnapshot.docs
         .map((doc) => doc.data().lastSecondWatched)
         .filter((lastSecond) => lastSecond !== undefined)
         .pop()

      return { lastSecondWatched }
   }

   const shouldFetch = Boolean(livestreamId && userId)

   return useSWR<{
      lastSecondWatched: number
   }>(
      shouldFetch ? `get-recording-stats-${livestreamId}-${userId}` : null,
      fetchStreams,
      {
         fallbackData: null,
         onError: (error) => {
            errorLogAndNotify(error, {
               message: "Error fetching recording stats",
               details: {
                  livestreamId,
                  userId,
               },
            })
         },
      }
   )
}
