import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { doc, getDoc } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Custom hook to fetch creator data for a given creator
 * @param groupId - The ID of the group/career center to fetch creator data from
 * @param creatorId - The ID of the creator to fetch data for
 * @returns SWR response containing creator data and loading state
 */
export const useCreator = (groupId: string, creatorId: string) => {
   const firestore = useFirestore()
   const fetcherKey = creatorId ? `creator-${groupId}-${creatorId}` : null

   const fetcher = async () => {
      try {
         if (!creatorId) return null

         const creatorDoc = doc(
            firestore,
            `careerCenterData/${groupId}/creators/${creatorId}`
         ).withConverter(createGenericConverter<Creator>())

         const querySnapshot = await getDoc(creatorDoc)

         if (!querySnapshot.exists()) {
            return null
         }

         // Return the actual creator data
         return querySnapshot.data()
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Error fetching creator data",
            creatorId,
         })
         return null
      }
   }

   return useSWR(fetcherKey, fetcher)
}
