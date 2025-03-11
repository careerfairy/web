import { RecordingToken } from "@careerfairy/shared-lib/livestreams/livestreams"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { doc, getDoc } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export const useRecordingTokenSWR = (livestreamId: string) => {
   const firestore = useFirestore()

   const fetchRecordingToken = async (): Promise<RecordingToken> => {
      const querySnapshot = await getDoc(
         doc(firestore, "livestreams", livestreamId, "recordingToken", "token")
      )

      return querySnapshot.data() as RecordingToken
   }

   const { data, isLoading, isValidating, error } = useSWR<RecordingToken>(
      `recording-token-${livestreamId}`,
      fetchRecordingToken,
      {
         fallbackData: null,
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: `Error fetching recording token for livestream ${livestreamId}`,
               livestreamId,
               key,
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
