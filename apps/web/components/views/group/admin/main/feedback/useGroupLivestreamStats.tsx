import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import usePaginatedCollection, {
   UsePaginatedCollection,
} from "components/custom-hook/utils/usePaginatedCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collectionGroup, query, where } from "firebase/firestore"
import { useMemo } from "react"

const useGroupLivestreamStats = (
   groupId: string,
   limit = 10,
   sort: "desc" | "asc" = "desc"
) => {
   // @ts-ignore we're sorting by a nested field livestream.start
   const options: UsePaginatedCollection<LiveStreamStats> = useMemo(
      () => ({
         query: query<LiveStreamStats>(
            // @ts-ignore
            collectionGroup(FirestoreInstance, "stats"),
            where("id", "==", "livestreamStats"),
            where("livestream.groupIds", "array-contains", groupId),
            where("livestream.start", "<", new Date()), // hide future livestreams
            where("livestream.test", "==", false)
         ),
         limit,
         orderBy: {
            field: "livestream.start",
            direction: sort,
         },
      }),
      [groupId, limit, sort]
   )

   return usePaginatedCollection<LiveStreamStats>(options)
}

export default useGroupLivestreamStats
