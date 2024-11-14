import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { ProfileLanguage } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { collection, onSnapshot, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

export const useUserLanguages = () => {
   const { userData } = useAuth()
   const firestore = useFirestore()
   const [languages, setLanguages] = useState<ProfileLanguage[]>([])

   useEffect(() => {
      if (userData.id) {
         const unsubscribe = onSnapshot(
            query(
               collection(firestore, "userData", userData.id, "languages")
            ).withConverter(createGenericConverter<ProfileLanguage>()),
            (doc) => {
               const newData = doc.docs?.map((doc) => doc.data()) || []
               setLanguages(newData)
            }
         )

         return () => unsubscribe()
      }
   }, [userData.id, firestore])

   return {
      data: languages,
      hasItems: Boolean(languages?.length),
   }
}
