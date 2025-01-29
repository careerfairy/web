import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/dist/universities"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { findElementsWithDuplicatePropertiesInArray } from "@careerfairy/shared-lib/dist/utils"
import * as cliProgress from "cli-progress"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import { universitiesRepo, userRepo } from "../../repositories"
import { logAction } from "../../util/logger"
import { getCLIBarOptions } from "../../util/misc"

type RemovedUniversitiesData = Record<
   string,
   {
      removedUniversity: University
      replacedBy: University
   }
>

type DeduplicationData = Record<
   string,
   {
      originalDocument: UniversityCountry
      deduplicatedUniversities: University[]
      removedUniversities: RemovedUniversitiesData
   }
>

type UserUniversitiesData = Record<
   string,
   {
      userIds: string[]
      countryId: string
      newUniversity: UserData["university"]
   }
>

const counter = new Counter()

const dedupeProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Deduping universities by country collection (universitiesByCountry)",
      "Universities by country collection deduped"
   ),
   cliProgress.Presets.shades_classic
)

const PERFORM_UPDATE = true
const SHOW_LONG_LOG = true

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

      const duplicationData = getCountriesWithDuplicateUniversities(
         allUniversitiesByCountry //.slice(0, 10) // While testing, we can limit the number of countries to dedupe
      )

      const duplicatedCountries = Object.keys(duplicationData) || []

      console.log(
         `Deduping resulted in ${duplicatedCountries.length} countries with duplicate universities`
      )

      // Fetch all users using the removed universities
      const userUniversities: UserUniversitiesData = {}

      const promises = []

      console.log(
         `Building promises for fetching users using the removed universities`
      )
      for (const countryId of duplicatedCountries) {
         const removedUniversities =
            duplicationData[countryId].removedUniversities

         for (const removedUniversity of Object.keys(removedUniversities)) {
            promises.push(
               getUsersUsingRemovedUniversities(
                  countryId,
                  removedUniversities[removedUniversity].removedUniversity
               ).then((users) => {
                  counter.addToReadCount(users?.length || 0)
                  users?.forEach((user) => {
                     const userIds =
                        userUniversities[removedUniversity]?.userIds || []

                     userUniversities[removedUniversity] = {
                        userIds: [...userIds, user.id],
                        countryId,
                        newUniversity: {
                           ...user.university,
                           // universitiesByCountry collection university has field id but userData university has field code
                           code: removedUniversities[removedUniversity]
                              .replacedBy.id,
                        },
                     }
                  })
               })
            )
         }
      }

      await logAction(
         () => Promise.all(promises),
         "fetching users using the removed universities"
      )

      const totalAffectedUsers = Object.values(userUniversities).reduce(
         (total, data) => total + data.userIds.length,
         0
      )

      console.log(`Total number of users affected: ${totalAffectedUsers}`)

      if (SHOW_LONG_LOG) {
         console.log("🚀 ~ user update data:", userUniversities)
         duplicatedCountries.forEach((countryId) => {
            console.log(
               `🚀 ~ ~ country: ${countryId} - original universities: ${duplicationData[countryId].originalDocument.universities.length} - deduplicated universities: ${duplicationData[countryId].deduplicatedUniversities.length}`
            )
            const removedUnis = Object.keys(
               duplicationData[countryId].removedUniversities
            )

            removedUnis.forEach((removedUniversity) => {
               console.log(
                  `🚀 ~ ~ ~ removed university: ${removedUniversity} -  ${duplicationData[countryId].removedUniversities[removedUniversity].removedUniversity.name}`
               )

               console.log(
                  `🚀 ~ ~ ~ ~ ~ replaced by: ${duplicationData[countryId].removedUniversities[removedUniversity].replacedBy.id} - ${duplicationData[countryId].removedUniversities[removedUniversity].replacedBy.name}`
               )

               console.log(
                  `🚀 ~ ~ ~ ~ ~ ~ ~ users to be updated: ${
                     userUniversities[removedUniversity]?.userIds ?? "none"
                  }`
               )
            })
         })
      }

      // Data update
      if (PERFORM_UPDATE) {
         console.log(`Updating "universitiesByCountry" collection`)
         duplicatedCountries.forEach((countryId) => {
            const docRef = firestore
               .collection("universitiesByCountry")
               .doc(countryId)

            bulkWriter.update(docRef, {
               universities:
                  duplicationData[countryId].deduplicatedUniversities,
            })

            counter.writeIncrement()
            dedupeProgressBar.increment()
         })

         console.log(`Updating "userData" collection`)
         Object.keys(userUniversities)?.forEach((universityId) => {
            userUniversities[universityId].userIds.forEach((userId) => {
               const docRef = firestore.collection("userData").doc(userId)

               bulkWriter.update(docRef, {
                  university: userUniversities[universityId].newUniversity,
               })

               counter.writeIncrement()
               dedupeProgressBar.increment()
            })
         })
      }

      dedupeProgressBar.stop()
      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
   } finally {
      counter.print()
   }
}

const getUsersUsingRemovedUniversities = async (
   countryId: string,
   removedUniversity: University
) => {
   return await userRepo.getUsersByUniversity(countryId, removedUniversity.id)
}

const getCountriesWithDuplicateUniversities = (
   universitiesByCountry: UniversityCountry[]
) => {
   const countriesWithDuplicates: DeduplicationData = {}

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

         const removedUniversitiesData: RemovedUniversitiesData = {}

         removedUniversities.forEach((university) => {
            removedUniversitiesData[university.id] = {
               removedUniversity: university,
               replacedBy: deduplicatedUniversities.find(
                  (deduplicatedUniversity) =>
                     deduplicatedUniversity.name === university.name
               ),
            }
         })

         countriesWithDuplicates[universityCountry.countryId] = {
            originalDocument: universityCountry,
            deduplicatedUniversities: deduplicatedUniversities,
            removedUniversities: removedUniversitiesData,
         }
      }
   })

   return countriesWithDuplicates
}
