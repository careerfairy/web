import { CircularProgress } from "@mui/material"
import useCountQuery from "components/custom-hook/useCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collectionGroup, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"

const AggregatedCompanyFollowersValue = () => {
   const { group } = useGroup()

   const q = useMemo(() => {
      return query(
         collectionGroup(FirestoreInstance, "companiesUserFollows"),
         where("groupId", "==", group.id)
      )
   }, [group.id])

   const { loading, count, error } = useCountQuery(q)

   if (loading) {
      return <CircularProgress color="secondary" size={30} />
   }

   if (error) {
      return <>0</>
   }

   return <>{count}</>
}

export default AggregatedCompanyFollowersValue
