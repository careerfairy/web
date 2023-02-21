import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { DataWithRef } from "../../../util/types"
import { Group } from "@careerfairy/shared-lib/dist/groups/groups"
import { isEmpty, uniq, uniqBy } from "lodash"
import { FieldValue } from "firebase-admin/firestore"
import { GroupOption } from "@careerfairy/shared-lib/dist/groups"

const counter = new Counter()

// types
type LivestreamWithRef = DataWithRef<true, LivestreamEvent>

// cached globally
let groupsDict: Record<string, Group>

export async function run() {
   try {
      Counter.log("Fetching all livestreams and groups")

      const [livestreams, groups] = await Promise.all([
         livestreamRepo.getAllLivestreams(false, true),
         groupRepo.getAllGroups(),
      ])

      Counter.log(
         `Fetched ${livestreams.length} livestreams and ${groups.length} groups`
      )

      counter.addToReadCount(livestreams.length + groups.length)

      groupsDict = convertDocArrayToDict(groups)

      // cascade group metadata to livestreams
      await cascadeHostsMetaDataToLivestream(livestreams)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeHostsMetaDataToLivestream = async (
   livestreams: LivestreamWithRef[]
) => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = livestreams
   const totalNumDocs = livestreams.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const livestreamsChunk = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      livestreamsChunk.forEach((stream) => {
         writeProgressBar.increment() // Increment progress bar

         // Get event hosts from groupsDict
         const eventHosts = stream.groupIds
            ?.map((groupId) => groupsDict[groupId])
            .filter(Boolean)

         if (eventHosts) {
            // get metadata from event hosts
            const metadata = getMetaDataFromEventHosts(eventHosts)

            if (metadata) {
               // update livestream with metadata
               const toUpdate: Pick<
                  LivestreamEvent,
                  "companyIndustries" | "companyCountries" | "companySizes"
               > = {
                  ...(!isEmpty(metadata.companyCountries) && {
                     // only update if there is data
                     companyCountries: FieldValue.arrayUnion(
                        ...metadata.companyCountries
                     ) as any,
                  }),
                  ...(!isEmpty(metadata.companyIndustries) && {
                     // only update if there is data
                     companyIndustries: FieldValue.arrayUnion(
                        ...metadata.companyIndustries
                     ) as any,
                  }),
                  ...(!isEmpty(metadata.companySizes) && {
                     // only update if there is data
                     companySizes: FieldValue.arrayUnion(
                        ...metadata.companySizes
                     ) as any,
                  }),
               }

               batch.update(stream._ref as any, toUpdate)
               counter.writeIncrement() // Increment write counter
            }
         }
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All batches committed! :)")
}

type Metadata = {
   companyCountries: GroupOption[]
   companyIndustries: GroupOption[]
   companySizes: string[]
}

const getMetaDataFromEventHosts = (eventHosts: Group[]): Metadata => {
   const isOneOrMoreCompanies =
      eventHosts?.filter((group) => !group.universityCode).length > 0

   let groupsToGetMetadataFrom = eventHosts

   if (isOneOrMoreCompanies) {
      // if there is at least one company, we only want to get the metadata ONLY from the companies, not the universities
      groupsToGetMetadataFrom = eventHosts.filter(
         (group) => !group.universityCode
      )
   }

   const metaData = groupsToGetMetadataFrom.reduce<Metadata>(
      (acc, group) => {
         if (group.companyCountry) {
            // aggregate all unique company countries (countries are unique by id)
            acc.companyCountries = uniqBy(
               [...acc.companyCountries, group.companyCountry],
               "id"
            )
         }

         if (group.companyIndustry) {
            // aggregate all unique company industries (industries are unique by id)
            acc.companyIndustries = uniqBy(
               [...acc.companyIndustries, group.companyIndustry],
               "id"
            )
         }

         if (group.companySize) {
            // aggregate all unique company sizes
            acc.companySizes = uniq([...acc.companySizes, group.companySize])
         }

         return acc
      },
      {
         companyCountries: [],
         companyIndustries: [],
         companySizes: [],
      }
   )

   // Return metadata if there is at least ONE field that is not empty
   if (Object.values(metaData).some((field) => !isEmpty(field))) {
      return metaData
   }

   return null
}
