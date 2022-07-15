import { collection, query, orderBy } from "firebase/firestore"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import { Reward } from "../../types/reward"

const useUserRewards = (userId: string) => {
   const collectionRef = query(
      collection(useFirestore(), "userData", userId, "rewards"),
      orderBy("createdAt", "desc")
   )

   let { status, data } = useFirestoreCollectionData<Reward>(
      collectionRef as any,
      {
         idField: "id", // this field will be added to the firestore object
      }
   )

   return {
      isLoading: status === "loading",
      data: data,
   }
}

export default useUserRewards
