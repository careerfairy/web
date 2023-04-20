import { collection, orderBy, query, where } from "firebase/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { limit } from "@firebase/firestore"
import { useFirestoreCollection } from "../../custom-hook/utils/useFirestoreCollection"

const now = new Date()
const useCompanyUpcomingLivestream = (groupId: string) => {
   const q = query<LivestreamEvent>(
      // @ts-ignore
      collection(FirestoreInstance, "livestreams"),
      where("groupIds", "array-contains", groupId),
      where("start", ">", now),
      orderBy("start", "desc"),
      limit(1)
   )

   return useFirestoreCollection<LivestreamEvent>(q, {
      idField: "id",
   })
}

export default useCompanyUpcomingLivestream
