import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CompanyFollowed } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { collection, onSnapshot, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

export const useUserFollowingCompanies = () => {
   const { userData } = useAuth()
   const firestore = useFirestore()
   const [companies, setCompanies] = useState<CompanyFollowed[]>([])

   useEffect(() => {
      if (userData.id) {
         const unsubscribe = onSnapshot(
            query(
               collection(
                  firestore,
                  "userData",
                  userData.id,
                  "companiesUserFollows"
               )
            ).withConverter(createGenericConverter<CompanyFollowed>()),
            (doc) => {
               const newData = doc.docs?.map((doc) => doc.data()) || []
               setCompanies(newData)
            }
         )

         return () => unsubscribe()
      }
   }, [userData.id, firestore])

   return companies
}
