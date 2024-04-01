import { Group } from "@careerfairy/shared-lib/groups"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { collection, getDocs } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"

export const useGroupsSWR = () => {
   const firestore = useFirestore()

   const fetchGroups = async (): Promise<Group[]> => {
      try {
         const querySnapshot = await getDocs(
            collection(firestore, "careerCenterData")
         )
         return querySnapshot.docs.map((doc) => doc.data() as Group)
      } catch (error) {
         throw error instanceof Error ? error : new Error("An error occurred")
      }
   }

   const { data, isLoading, isValidating, error } = useSWR<Group[]>(
      "all-career-center-data",
      fetchGroups,
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )

   return {
      data,
      isLoading,
      isValidating,
      error,
   }
}
