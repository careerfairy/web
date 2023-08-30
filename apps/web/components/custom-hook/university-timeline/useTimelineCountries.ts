import { collection, query, orderBy } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { TimelineCountry } from "@careerfairy/shared-lib/universities/universityTimeline"

/**
 * Custom hook to get timeline countries from the database
 **/
export const useTimelineCountries = () => {
   const uniQuery = query(collection(FirestoreInstance, "timelineCountries"))
   return useFirestoreCollection<TimelineCountry>(uniQuery, {
      idField: "id",
      suspense: false,
   })
}

export default useTimelineCountries
