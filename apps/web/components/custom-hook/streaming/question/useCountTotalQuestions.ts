import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import { collection, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"

export const useCountTotalQuestions = (
   livestreamId: string,
   type: "upcoming" | "answered"
) => {
   const firestore = useFirestore()

   const q = query(
      collection(firestore, "livestreams", livestreamId, "questions"),
      type === "upcoming"
         ? where("type", "in", ["done", "current"])
         : where("type", "==", "done")
   )

   return useSWRCountQuery(q, {
      refreshInterval: 30000,
   })
}
