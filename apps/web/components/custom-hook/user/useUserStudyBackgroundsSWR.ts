import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { StudyBackground } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export const useUserStudyBackgroundsSWR = () => {
   const { userData } = useAuth()
   const firestore = useFirestore()

   return useSWR<StudyBackground[]>(
      `user-${userData.id}-study-backgrounds`,
      async () => {
         const studyBackgroundsQuery = query(
            collection(firestore, `userData/${userData.id}/studyBackgrounds`),
            orderBy("startedAt", "asc")
         ).withConverter(createGenericConverter<StudyBackground>())

         const querySnapshot = await getDocs(studyBackgroundsQuery)

         return querySnapshot.docs.map((doc) => doc.data()) || []
      },
      {
         suspense: true,
         onError: (error) =>
            errorLogAndNotify(
               error,
               `Failed to fetch study backgrounds for user with auth id: ${userData.id}`
            ),
      }
   )
}
