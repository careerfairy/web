import { CircularProgress } from "@mui/material"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import {
   collectionGroup,
   getCountFromServer,
   query,
   where,
} from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

const useCountTalentPoolForGroup = (groupId: string) => {
   const [count, setCount] = useState<number | null>(null)

   useEffect(() => {
      let mounted = true

      const ref = query(
         collectionGroup(FirestoreInstance, "talentProfiles"),
         where("groupId", "==", groupId)
      )

      getCountFromServer(ref)
         .then((r) => {
            if (mounted) {
               setCount(r.data().count)
            }
         })
         .catch((e) => {
            errorLogAndNotify(e)
            setCount(0)
         })

      return () => {
         mounted = false
      }
   }, [groupId])

   return count
}

export const AggregatedTalentPoolValue = () => {
   const {
      query: { groupId },
   } = useRouter()

   const count = useCountTalentPoolForGroup(groupId as string)

   if (count === null) {
      return <CircularProgress color="secondary" size={30} />
   }

   return <>{count}</>
}
