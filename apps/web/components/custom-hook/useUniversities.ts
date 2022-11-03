import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/dist/universities"
import { useEffect, useState } from "react"
import { errorLogAndNotify } from "../../util/CommonUtil"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"

const useUniversitiesByCountryCodes = (
   selectedCountryCodes: OptionGroup[]
): University[] => {
   const [allUniversities, setAllUniversities] = useState([] as University[])
   const firebase = useFirebaseService()

   // to get all the universities based on the selected countries sorted by alphabetic order
   useEffect(() => {
      ;(async () => {
         if (selectedCountryCodes) {
            if (selectedCountryCodes.length === 0) {
               setAllUniversities([])
            } else {
               try {
                  const selectedCountriesIds = selectedCountryCodes.map(
                     (option) => option.id
                  )
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
   }, [firebase, selectedCountryCodes])

   return allUniversities
}

export default useUniversitiesByCountryCodes
