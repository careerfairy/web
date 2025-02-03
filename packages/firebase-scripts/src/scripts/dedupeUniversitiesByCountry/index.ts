import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/dist/universities"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { chunkArray } from "@careerfairy/shared-lib/dist/utils"
import * as cliProgress from "cli-progress"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import { universitiesRepo, userRepo } from "../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
} from "../../util/bulkWriter"
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

const PERFORM_UPDATE = false
const SHOW_LONG_LOG = false

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

      duplicatedCountries.forEach((countryId) => {
         console.log(
            `Country: ${countryId} will have ${duplicationData[countryId].deduplicatedUniversities.length} universities from ${duplicationData[countryId].originalDocument.universities.length}`
         )
      })

      // Fetch all users using the removed universities
      const allUsers = await logAction(
         () => userRepo.getAllUsers(),
         "fetching all users"
      )

      const userUniversities: UserUniversitiesData = {}

      console.log(
         `Building promises for fetching users using the removed universities`
      )

      for (const countryId of duplicatedCountries) {
         const removedUniversities =
            duplicationData[countryId].removedUniversities

         for (const removedUniversity of Object.keys(removedUniversities)) {
            if (SHOW_LONG_LOG) {
               console.log(
                  `COUNTRY: ${countryId} - filtering users for ${removedUniversity}`
               )
            }
            const users = allUsers?.filter(
               (user) =>
                  user?.university?.code ===
                  removedUniversities[removedUniversity].removedUniversity.id
            )

            users?.forEach((user) => {
               const userIds =
                  userUniversities[removedUniversity]?.userIds || []

               userUniversities[removedUniversity] = {
                  userIds: [...userIds, user.id],
                  countryId,
                  newUniversity: {
                     ...user.university,
                     // universitiesByCountry collection university has field id but userData university has field code
                     code: removedUniversities[removedUniversity].replacedBy.id,
                     name: removedUniversities[removedUniversity].replacedBy
                        .name,
                  },
               }
            })
         }
      }

      const totalAffectedUsers = Object.values(userUniversities).reduce(
         (total, data) => total + data.userIds.length,
         0
      )

      console.log(`Total number of users affected: ${totalAffectedUsers}`)

      if (SHOW_LONG_LOG) {
         console.log(
            `Users to be updated: ${JSON.stringify(userUniversities, null, 2)}`
         )

         console.log("🚀 ~ user update data:", userUniversities)

         duplicatedCountries.forEach((countryId) => {
            console.log(
               `🚀 ~ ~ COUNTRY: ${countryId} - original universities: ${duplicationData[countryId].originalDocument.universities.length} - deduplicated universities: ${duplicationData[countryId].deduplicatedUniversities.length}`
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
         const chunkedDuplicatedCountries = chunkArray(duplicatedCountries, 50)

         console.log(
            `Updating "universitiesByCountry" collection: ${duplicatedCountries.length} countries split into ${chunkedDuplicatedCountries.length} chunks`
         )

         for (let i = 0; i < chunkedDuplicatedCountries.length; i++) {
            for (const countryId of chunkedDuplicatedCountries[i]) {
               const docRef = firestore
                  .collection("universitiesByCountry")
                  .doc(countryId)

               bulkWriter
                  .update(docRef, {
                     universities:
                        duplicationData[countryId].deduplicatedUniversities,
                  })
                  .then(() => handleBulkWriterSuccess(counter))
                  .catch((e) => handleBulkWriterError(e, counter))

               counter.writeIncrement()
               dedupeProgressBar.increment()
            }

            await logAction(
               () => bulkWriter.flush(),
               `Flushing chunk ${i + 1} of ${chunkedDuplicatedCountries.length}`
            )
               .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
               .catch((e) => handleBulkWriterError(e, counter))
         }

         const userUpdates: {
            userId: string
            university: UserData["university"]
         }[] = []
         Object.keys(userUniversities)?.forEach((universityId) => {
            userUniversities[universityId].userIds.forEach((userId) => {
               userUpdates.push({
                  userId,
                  university: userUniversities[universityId].newUniversity,
               })
            })
         })

         const chunkedUserUpdates = chunkArray(userUpdates, 200)

         console.log(
            `Updating "userData" collection: ${userUpdates.length} users split into ${chunkedUserUpdates.length} chunks`
         )
         for (let i = 0; i < chunkedUserUpdates.length; i++) {
            for (const userUpdate of chunkedUserUpdates[i]) {
               const docRef = firestore
                  .collection("userData")
                  .doc(userUpdate.userId)
               bulkWriter.update(docRef, { university: userUpdate.university })
            }
            await logAction(
               () => bulkWriter.flush(),
               `Flushing chunk ${i + 1} of ${chunkedUserUpdates.length}`
            )
               .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
               .catch((e) => handleBulkWriterError(e, counter))
         }
      }

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
   const countriesWithDuplicates: DeduplicationData = {}

   universitiesByCountry?.forEach((universityCountry) => {
      const universities = universityCountry.universities

      // Deduplication by id
      const universitiesMap = new Map(universities.map((d) => [d.id, d]))

      const deduplicatedUniversitiesById = [...universitiesMap.values()]

      const deduplicatedUniversitiesByName = [
         ...new Map(
            deduplicatedUniversitiesById.map((d) => [d.name, d])
         ).values(),
      ]

      const deduplicatedUniversities = [
         ...deduplicatedUniversitiesByName.values(),
      ]

      const removedUniversities = universities.filter((university) => {
         return !deduplicatedUniversities.includes(university)
      })

      const removedUniversitiesData: RemovedUniversitiesData = {}

      removedUniversities.forEach((university) => {
         removedUniversitiesData[university.id] = {
            removedUniversity: university,
            replacedBy: deduplicatedUniversities.find(
               (deduplicatedUniversity) =>
                  deduplicatedUniversity.name === university.name ||
                  deduplicatedUniversity.id === university.id
            ),
         }
      })

      countriesWithDuplicates[universityCountry.countryId] = {
         originalDocument: universityCountry,
         deduplicatedUniversities: deduplicatedUniversities,
         removedUniversities: removedUniversitiesData,
      }
   })

   return countriesWithDuplicates
}
