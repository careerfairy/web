import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { StudyBackground } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

export const useUserStudyBackgrounds = () => {
   const { userData } = useAuth()
   const firestore = useFirestore()
   const [studyBackgrounds, setStudyBackgrounds] = useState<StudyBackground[]>(
      []
   )

   useEffect(() => {
      if (userData.id) {
         const unsubscribe = onSnapshot(
            query(
               collection(
                  firestore,
                  "userData",
                  userData.id,
                  "studyBackgrounds"
               ),
               orderBy("startedAt", "desc")
            ).withConverter(createGenericConverter<StudyBackground>()),
            (doc) => {
               // doc.docs
               const newData = doc.docs?.map((doc) => doc.data()) || []
               setStudyBackgrounds(newData)
            }
         )

         return () => unsubscribe()
      }
   }, [userData.id, firestore])

   return {
      data: studyBackgrounds,
      hasItems: Boolean(studyBackgrounds?.length),
   }
}
