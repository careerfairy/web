import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { doc, getDoc } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export const useLivestreamSWR = (
   livestreamId: string,
   options?: SWRConfiguration<LivestreamEvent | null>
) => {
   const firestore = useFirestore()

   return useSWR(
      livestreamId ? `livestream-${livestreamId}` : null,
      async () => {
         const docRef = doc(
            firestore,
            "livestreams",
            livestreamId
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const docSnap = await getDoc(docRef)

         return docSnap.exists() ? docSnap.data() : null
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error) =>
            errorLogAndNotify(error, {
               message: "Failed to fetch livestream",
               details: {
                  livestreamId,
               },
            }),
         suspense: false,
         ...options,
      }
   )
}
