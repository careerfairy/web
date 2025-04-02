import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
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
         doc(
            firestore,
            "livestreams",
            livestreamId,
            "recordingToken",
            "token"
         ).withConverter(createGenericConverter<RecordingToken>())
      )

      return querySnapshot.data()
   }

   return useSWR<RecordingToken>(
      livestreamId ? `recording-token-${livestreamId}` : null,
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
}
