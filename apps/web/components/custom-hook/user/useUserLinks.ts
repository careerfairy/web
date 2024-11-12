import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { ProfileLink } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { collection, onSnapshot, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

export const useUserLinks = () => {
   const { userData } = useAuth()
   const firestore = useFirestore()
   const [links, setLinks] = useState<ProfileLink[]>([])

   useEffect(() => {
      if (userData.id) {
         const unsubscribe = onSnapshot(
            query(
               collection(firestore, "userData", userData.id, "links")
            ).withConverter(createGenericConverter<ProfileLink>()),
            (doc) => {
               const newData = doc.docs?.map((doc) => doc.data()) || []
               setLinks(newData)
            }
         )

         return () => unsubscribe()
      }
   }, [userData.id, firestore])

   return {
      data: links,
      hasItems: Boolean(links?.length),
   }
}
