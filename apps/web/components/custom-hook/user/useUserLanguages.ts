import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   LanguageProficiencyOrderMap,
   LanguageProficiencyValues,
} from "@careerfairy/shared-lib/constants/forms"
import { ProfileLanguage } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { languageCodesDict } from "components/helperFunctions/streamFormFunctions"
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
               setLanguages(sortLanguages(newData))
            }
         )

         return () => {
            unsubscribe()
            setLanguages([])
         }
      }
   }, [userData.id, firestore])

   return {
      data: languages,
      hasItems: Boolean(languages?.length),
   }
}

const sortLanguages = (languages: ProfileLanguage[]) => {
   return languages.sort((langA, langB) => {
      // Compare by proficiency level first
      const proficiencyComparison =
         LanguageProficiencyOrderMap[
            LanguageProficiencyValues[langB.proficiency]
         ] -
         LanguageProficiencyOrderMap[
            LanguageProficiencyValues[langA.proficiency]
         ]

      if (proficiencyComparison !== 0) {
         return proficiencyComparison
      }

      // If proficiency is the same, compare alphabetically by name
      const nameA = languageCodesDict[langA.languageId]["name"]
      const nameB = languageCodesDict[langB.languageId]["name"]

      return nameA.localeCompare(nameB)
   })
}
