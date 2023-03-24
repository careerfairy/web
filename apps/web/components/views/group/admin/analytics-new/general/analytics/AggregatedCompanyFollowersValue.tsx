import useCountQuery from "components/custom-hook/useCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collectionGroup, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { RenderAsyncCount } from "../../../common/CardAnalytic"

const AggregatedCompanyFollowersValue = () => {
   const { group } = useGroup()

   const q = useMemo(() => {
      return query(
         collectionGroup(FirestoreInstance, "companiesUserFollows"),
         where("groupId", "==", group.id)
      )
   }, [group.id])

   const res = useCountQuery(q)

   return <RenderAsyncCount {...res} />
}

export default AggregatedCompanyFollowersValue
