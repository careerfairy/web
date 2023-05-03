import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to get a livestream from the database
 **/
const useLivestream = (livestreamId: string, initialData?: LivestreamEvent) => {
   return useFirestoreDocument<LivestreamEvent>("livestreams", [livestreamId], {
      idField: "id",
      suspense: false,
      initialData,
   })
}

export default useLivestream
