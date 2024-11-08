import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { StudyBackground } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { collection, getDocs, query } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export const useUserStudyBackgroundsSWR = (suspense: boolean = true) => {
   const { userData } = useAuth()
   const firestore = useFirestore()

   return useSWR<StudyBackground[]>(
      `user-${userData.authId}-study-backgrounds`,
      async () => {
         const studyBackgroundsQuery = query(
            collection(firestore, `userData/${userData.id}/studyBackgrounds`)
         ).withConverter(createGenericConverter<StudyBackground>())

         const querySnapshot = await getDocs(studyBackgroundsQuery)

         return querySnapshot.docs.map((doc) => doc.data()) || []
      },
      {
         suspense,
         onError: (error) =>
            errorLogAndNotify(
               error,
               `Failed to fetch study backgrounds for user with auth id: ${userData.authId}`
            ),
      }
   )
}
