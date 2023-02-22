import { CircularProgress } from "@mui/material"
import useCountQuery from "components/custom-hook/useCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collectionGroup, query, where } from "firebase/firestore"
import { useRouter } from "next/router"
import { useMemo } from "react"

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

   const { loading, count, error } = useCountQuery(q)

   if (loading) {
      return <CircularProgress color="secondary" size={30} />
   }

   if (error) {
      return <>0</>
   }

   return <>{count}</>
}
