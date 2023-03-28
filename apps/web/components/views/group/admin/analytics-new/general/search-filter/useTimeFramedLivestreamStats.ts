import { useMemo } from "react"
import {
   collectionGroup,
   orderBy,
   query,
   QueryConstraint,
   where,
} from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { OrderByDirection } from "@firebase/firestore"
import { TimeFrame, TimeFrames } from "../GeneralPageProvider"

const useTimeFramedLivestreamStats = (
   timeFrame: TimeFrame,
   order: OrderByDirection = "desc"
) => {
   const { group } = useGroup()
   const livestreamStatsQuery = useMemo(() => {
      const timeFrameData = TimeFrames[timeFrame]

      const constraints: QueryConstraint[] = [
         where("id", "==", "livestreamStats"),
         where("livestream.groupIds", "array-contains", group.id),
         where("livestream.start", ">=", timeFrameData.start),
         orderBy("livestream.start", order),
      ]

      if (timeFrameData.end) {
         constraints.push(where("livestream.start", "<=", timeFrameData.end))
      }

      return query(collectionGroup(FirestoreInstance, "stats"), ...constraints)
   }, [group.id, order, timeFrame])

   return useFirestoreCollection<LiveStreamStats>(livestreamStatsQuery, {
      suspense: false,
      idField: "id",
   })
}

export default useTimeFramedLivestreamStats
