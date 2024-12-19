import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { StudyBackground } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { Timestamp } from "data/firebase/FirebaseInstance"
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
         const cachedBackgrounds = sessionStorage.getItem(
            `study-backgrounds-${userData.id}`
         )

         if (cachedBackgrounds) {
            console.log(
               "🚀 ~ useEffect ~ cachedBackgrounds:",
               JSON.parse(cachedBackgrounds)
            )
            setStudyBackgrounds(
               (JSON.parse(cachedBackgrounds) as any[]).map((data) => ({
                  ...data,
                  startedAt: data.startedAt
                     ? Timestamp.fromDate(new Date(data.startedAt))
                     : undefined,
                  endedAt: data.endedAt
                     ? Timestamp.fromDate(new Date(data.endedAt))
                     : undefined,
               }))
            )
         }

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
               const newData = doc.docs?.map((doc) => doc.data()) || []
               setStudyBackgrounds(newData)
               sessionStorage.setItem(
                  `study-backgrounds-${userData.id}`,
                  JSON.stringify(
                     newData.map((data) => ({
                        ...data,
                        startedAt: data.startedAt?.toDate(),
                        endedAt: data.endedAt?.toDate(),
                     }))
                  )
               )
            }
         )

         return () => {
            unsubscribe()
            setStudyBackgrounds([])
         }
      }
   }, [userData.id, firestore])

   return {
      data: studyBackgrounds,
      hasItems: Boolean(studyBackgrounds?.length),
   }
}
