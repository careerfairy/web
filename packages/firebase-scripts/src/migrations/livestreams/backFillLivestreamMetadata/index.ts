import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { getMetaDataFromEventHosts } from "@careerfairy/shared-lib/dist/groups/metadata"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { isEmpty } from "lodash"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()

// types
type LivestreamWithRef = DataWithRef<true, LivestreamEvent>

// cached globally
let groupsDict: Record<string, Group>

export async function run() {
   try {
      Counter.log("Fetching all livestreams and groups")

      const [livestreams, groups] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreams(false, true),
               groupRepo.getAllGroups(),
            ]),
         "Fetching all livestreams and groups"
      )

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
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

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

            // Return metadata if there is at least ONE field that is not empty
            const hasMetadataToUpdate = Object.values(metadata).some(
               (field) => !isEmpty(field)
            )

            if (hasMetadataToUpdate) {
               // update livestream with metadata
               const toUpdate: Pick<
                  LivestreamEvent,
                  | "companyIndustries"
                  | "companyCountries"
                  | "companySizes"
                  | "companyTargetedCountries"
                  | "companyTargetedUniversities"
                  | "companyTargetedFieldsOfStudies"
               > = {
                  companyIndustries: metadata.companyIndustries,
                  companyCountries: metadata.companyCountries,
                  companySizes: metadata.companySizes,
                  companyTargetedCountries: metadata.companyTargetedCountries,
                  companyTargetedFieldsOfStudies:
                     metadata.companyTargetedFieldsOfStudies,
                  companyTargetedUniversities:
                     metadata.companyTargetedUniversities,
               }

               // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
