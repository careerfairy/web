import useCountQuery from "components/custom-hook/useCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collectionGroup, query, where } from "firebase/firestore"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { RenderAsyncCount } from "../../common/CardAnalytic"

export const AggregatedTalentPoolValue = () => {
   const {
      query: { groupId },
   } = useRouter()

   const q = useMemo(() => {
      return query(
         collectionGroup(FirestoreInstance, "talentProfiles"),
         where("groupId", "==", groupId)
      )
   }, [groupId])

   const res = useCountQuery(q)

   return <RenderAsyncCount {...res} />
}
