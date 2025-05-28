import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Custom hook to fetch creator data for a given speaker ID
 * @param speakerId - The ID of the speaker to fetch creator data for
 * @param careerCenterId - Optional career center ID to specify which collection to query
 * @returns SWR response containing creator data and loading state
 */
export const useCreator = (groupId: string, speakerId: string) => {
   const firestore = useFirestore()
   const fetcherKey = speakerId ? `creator-${groupId}-${speakerId}` : null

   const fetcher = async () => {
      try {
         if (!speakerId) return null

         const creatorsQuery = query(
            collection(firestore, `careerCenterData/${groupId}/creators`),
            where("id", "==", speakerId),
            limit(1)
         ).withConverter(createGenericConverter<Creator>())

         const querySnapshot = await getDocs(creatorsQuery)

         if (querySnapshot.empty) {
            return null
         }

         // Return the actual creator data
         return querySnapshot.docs[0].data()
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Error fetching creator data",
            speakerId,
         })
         return null
      }
   }

   return useSWR(fetcherKey, fetcher)
}
