import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/dist/universities"
import { useEffect, useState } from "react"
import { errorLogAndNotify } from "../../util/CommonUtil"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"

const useUniversitiesByCountryCodes = (
   selectedCountriesIds: string[]
): University[] => {
   const [allUniversities, setAllUniversities] = useState<University[]>([])
   const firebase = useFirebaseService()

   // to get all the universities based on the selected countries sorted by alphabetic order
   useEffect(() => {
      ;(async () => {
         if (selectedCountriesIds) {
            if (selectedCountriesIds.length === 0) {
               setAllUniversities([])
            } else {
               try {
                  const universitiesSnapShot =
                     await firebase.getUniversitiesFromMultipleCountryCode(
                        selectedCountriesIds
                     )

                  const allUniversities = universitiesSnapShot.docs
                     .reduce((acc, doc) => {
                        const universitiesCountries =
                           doc.data() as UniversityCountry
                        return [...acc, ...universitiesCountries.universities]
                     }, [])
                     .sort(dynamicSort("name"))

                  setAllUniversities(allUniversities)
               } catch (e) {
                  errorLogAndNotify(e)
               }
            }
         }
      })()
   }, [firebase, selectedCountriesIds])

   return allUniversities
}

export default useUniversitiesByCountryCodes
