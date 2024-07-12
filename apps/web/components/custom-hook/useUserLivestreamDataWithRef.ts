import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { doc } from "firebase/firestore"
import { useFirestore, useFirestoreDocDataOnce } from "reactfire"
import useStreamRef from "./useStreamRef"

const useUserLivestreamDataWithRef = (
   streamRef: ReturnType<typeof useStreamRef>,
   userId: string
) => {
   const userLivestreamDataRef = doc(
      useFirestore(),
      streamRef.path,
      "userLivestreamData",
      userId
   ).withConverter(createGenericConverter<UserLivestreamData>())

   return useFirestoreDocDataOnce(userLivestreamDataRef).data
}

export default useUserLivestreamDataWithRef
