/* eslint-disable no-extra-semi */
import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/universities"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { useEffect, useState } from "react"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { errorLogAndNotify } from "../../util/CommonUtil"

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
