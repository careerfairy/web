import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { doc } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreDocDataOnce } from "reactfire"

const useGroupCreatorOnce = (groupId: string, creatorId: string) => {
   const groupSparksQuery = useMemo(() => {
      return doc(
         FirestoreInstance,
         "careerCenterData",
         groupId,
         "creators",
         creatorId
      ).withConverter(createGenericConverter<Creator>())
   }, [creatorId, groupId])

   return useFirestoreDocDataOnce(groupSparksQuery, {
      idField: "id",
   })
}

export default useGroupCreatorOnce
