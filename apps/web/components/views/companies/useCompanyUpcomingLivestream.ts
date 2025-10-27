import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { limit, QueryConstraint } from "@firebase/firestore"
import { collection, orderBy, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../../custom-hook/utils/useFirestoreCollection"

const now = new Date()
const useCompanyUpcomingLivestream = (
   groupId: string,
   getHiddenEvents?: boolean
) => {
   const constraints: QueryConstraint[] = []

   if (!getHiddenEvents) {
      constraints.push(where("hidden", "==", false))
   }

   // Exclude panels by default
   constraints.push(where("livestreamType", "==", "livestream"))

   const q = query<LivestreamEvent>(
      // @ts-ignore
      collection(FirestoreInstance, "livestreams"),
      where("groupIds", "array-contains", groupId),
      where("start", ">", now),
      ...constraints,
      orderBy("start", "desc"),
      limit(1)
   )

   return useFirestoreCollection<LivestreamEvent>(q, {
      idField: "id",
   })
}

export default useCompanyUpcomingLivestream
