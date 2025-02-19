import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

type Options = {
   suspense?: boolean
}

export const useLivestreamSWR = (livestreamId: string, options?: Options) => {
   const suspense = options?.suspense ?? false

   const firestore = useFirestore()

   return useSWR<LivestreamEvent>(
      livestreamId ? `livestream-${livestreamId}` : null,
      async () => {
         const livestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("id", "==", livestreamId)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const querySnapshot = await getDocs(livestreamsQuery)

         return querySnapshot.docs?.at(0)?.data()
      },
      {
         suspense,
         onError: (error) =>
            errorLogAndNotify(error, {
               message: "Failed to fetch livestream",
               details: {
                  livestreamId,
               },
            }),
      }
   )
}
