import { RewardDoc } from "@careerfairy/shared-lib/dist/rewards"
import { collection, query, orderBy } from "firebase/firestore"
import { useFirestore, useFirestoreCollectionData } from "reactfire"

/**
 * Fetch the rewards for a given user
 *
 * This hook will suspend when loading data
 * Use an ErrorBoundary to handle errors
 *
 * @param userId
 */
const useUserRewards = (userId: string) => {
   const collectionRef = query(
      collection(useFirestore(), "userData", userId, "rewards"),
      orderBy("createdAt", "desc")
   )

   return useFirestoreCollectionData<RewardDoc>(collectionRef as any, {
      idField: "id", // this field will be added to the firestore object
   })
}

export default useUserRewards
