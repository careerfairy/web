import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/dist/universities"
import { findElementsWithDuplicatePropertiesInArray } from "@careerfairy/shared-lib/dist/utils"
import * as cliProgress from "cli-progress"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import { universitiesRepo } from "../../repositories"
import { logAction } from "../../util/logger"
import { getCLIBarOptions } from "../../util/misc"

const counter = new Counter()

const dedupeProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Deduping universities by country collection (universitiesByCountry)",
      "Universities by country collection deduped"
   ),
   cliProgress.Presets.shades_classic
)

export async function run() {
   console.log("Start deduping universities by country collection")
   const bulkWriter = firestore.bulkWriter()

   try {
      const allUniversitiesByCountry = await logAction(
         () => universitiesRepo.getAllUniversitiesByCountries(),
         "Fetching all universities by country"
      )

      console.log(
         `Start deduping ${allUniversitiesByCountry?.length} universities by country documents`
      )
      counter.addToReadCount(allUniversitiesByCountry?.length)

      // const china = await universitiesRepo.getUniversityByCountryId("CN")
      // console.log("🚀 ~ run ~ china length:", china?.universities?.length)

      const duplicationData = getCountriesWithDuplicateUniversities(
         allUniversitiesByCountry.slice(0, 2)
      )

      const duplicatedCountries = Object.keys(duplicationData) || []

      // Logging
      console.log("🚀 ~ duplicate countries list: ", duplicatedCountries.length)
      duplicatedCountries.forEach((countryId) => {
         console.log(
            `🚀 ~ ~ country: ${countryId} - original universities: ${duplicationData[countryId].originalDocument.universities.length} - deduplicated universities: ${duplicationData[countryId].deduplicatedUniversities.length}`
         )
         console.log(
            `🚀 ~ ~ ~ removed universities: ${duplicationData[
               countryId
            ].removedUniversities
               .map((university) => university.name)
               .join(", ")}`
         )
      })

      // Data update
      duplicatedCountries.forEach((countryId) => {
         const docRef = firestore
            .collection("universitiesByCountry")
            .doc(countryId)

         bulkWriter.update(docRef, {
            universities: duplicationData[countryId].deduplicatedUniversities,
         })

         counter.writeIncrement()
         dedupeProgressBar.increment()
      })

      dedupeProgressBar.stop()
      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
   } finally {
      counter.print()
   }
}

const getCountriesWithDuplicateUniversities = (
   universitiesByCountry: UniversityCountry[]
) => {
   const countriesWithDuplicates: Record<
      string,
      {
         originalDocument: UniversityCountry
         deduplicatedUniversities: University[]
         removedUniversities: University[]
      }
   > = {}

   universitiesByCountry?.forEach((universityCountry) => {
      const universities = universityCountry.universities
      const duplicates = findElementsWithDuplicatePropertiesInArray(
         universities,
         ["name"],
         "id"
      )

      // We could always create the Map but this is a bit more efficient as we
      // only perform the operation if there are duplicates
      if (duplicates.length > 0) {
         const deduplicatedUniversities = [
            ...new Map(universities.map((d) => [d.name, d])).values(),
         ]

         const removedUniversities = universities.filter(
            (university) => !deduplicatedUniversities.includes(university)
         )

         countriesWithDuplicates[universityCountry.countryId] = {
            originalDocument: universityCountry,
            deduplicatedUniversities: deduplicatedUniversities,
            removedUniversities: removedUniversities,
         }
      }
   })

   return countriesWithDuplicates
}
