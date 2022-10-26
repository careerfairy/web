import { firestore } from "./lib/firebase"
import { universityCountriesArray } from "@careerfairy/shared-lib/dist/universities"
import { v4 as uuidv4 } from "uuid"

interface UniversitiesSeed {
   /**
    * Creates a basic university by country collection With
    * each collection having a university of the country in mind
    */
   createBasicUniversities(): Promise<void>
   /**
    * Delete the basic university by country collection
    */
   deleteUniversities(): Promise<void>
}

class UniversitiesFirebaseSeed implements UniversitiesSeed {
   /**
    * Creates the university by country collection With
    * each collection having a university of the country in mind
    */
   async createBasicUniversities() {
      const batch = firestore.batch()

      universityCountriesArray.forEach((country) => {
         const universityCountryRef = firestore
            .collection("universitiesByCountry")
            .doc(country.code)
         batch.set(universityCountryRef, {
            countryId: country.code,
            universities: [
               {
                  id: uuidv4(),
                  name: `University of ${country.name}`,
                  webPage: "",
               },
            ],
         })
      })

      await batch.commit()
      return
   }

   /**
    * Delete the basic university by country collection
    */
   async deleteUniversities() {
      const batch = firestore.batch()
      universityCountriesArray.forEach((country) => {
         const universityCountryRef = firestore
            .collection("universitiesByCountry")
            .doc(country.code)
         batch.delete(universityCountryRef)
      })
      await batch.commit()
      return
   }
}

const instance: UniversitiesSeed = new UniversitiesFirebaseSeed()

export default instance
