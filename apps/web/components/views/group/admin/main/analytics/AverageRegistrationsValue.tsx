import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { CircularProgress } from "@mui/material"
import useCountQuery from "components/custom-hook/useCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query, where } from "firebase/firestore"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useMemo } from "react"

const AverageRegistrationsValue = () => {
   const {
      query: { groupId },
   } = useRouter()
   const { stats } = useGroup()

   const q = useMemo(() => {
      return query(
         collection(FirestoreInstance, "livestreams"),
         where("groupIds", "array-contains", groupId),
         where("test", "==", false)
      )
   }, [groupId])

   const { loading, count, error } = useCountQuery(q)

   if (loading) {
      return <CircularProgress color="secondary" size={30} />
   }

   if (error) {
      return <>0</>
   }

   return <>{averageRegistrationsPerLivestream(stats, count)}</>
}

function averageRegistrationsPerLivestream(
   stats: GroupStats,
   totalLivestreams: number
) {
   if (
      !stats ||
      stats?.generalStats?.numberOfRegistrations === undefined ||
      !totalLivestreams
   )
      return 0

   return Math.round(
      stats.generalStats.numberOfRegistrations / totalLivestreams
   )
}

export default AverageRegistrationsValue
