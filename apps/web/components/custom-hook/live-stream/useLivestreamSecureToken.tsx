import { FirestoreInstance } from "data/firebase/FirebaseInstance"

export type useLivestreamSecureTokenOptions = {
   livestreamId: string
   disabled?: boolean
}

const useLivestreamSecureTokenSWR = async (
   options: useLivestreamSecureTokenOptions
) => {
   // const { data } = useFirestoreDocument<LivestreamEvent>("livestreams", [
   //     options.livestreamId.toString(),
   //  ])

   // useFirestoreCollectionData(

   // )
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let documentSnap: any = FirestoreInstance.collection("livestreams").doc(
      options.livestreamId
   )

   documentSnap = await documentSnap
      .collection("tokens")
      .doc("secureToken")
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data()?.value
}

// const swrOptions: SWRConfiguration = {
//    ...reducedRemoteCallsOptions,
//    keepPreviousData: true,
//    suspense: false,
//    onError: (error, key) =>
//       errorLogAndNotify(error, {
//          message: `Error fetching livestreams with options: ${key}`,
//       }),
// }

export default useLivestreamSecureTokenSWR
