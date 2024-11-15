import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/universities"
import { useFirestoreDocument } from "./utils/useFirestoreDocument"

export const useUniversityById = (
   universityCountryCode: string,
   universityId: string
): University => {
   const { data: universityCountryData } =
      useFirestoreDocument<UniversityCountry>("universitiesByCountry", [
         universityCountryCode,
      ])

   if (!universityCountryData) return null

   const countryUniversities = universityCountryData.universities

   return countryUniversities
      ?.filter((university) => university.id === universityId)
      ?.at(0)
}
