import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { DeepPartial } from "@careerfairy/shared-lib/dist/utils/types"
import { logAction } from "../../../util/logger"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const counter = new Counter()

const COMPANY_SIZE = "1001+"
const NEW_COMPANY_SIZE = "1001-3000"

export async function run() {
   try {
      const [livestreams, groups] = await Promise.all([
         logAction(
            () => livestreamRepo.getAllLivestreamsWithCompanySize(COMPANY_SIZE),
            "Fetching Livestreams"
         ),
         logAction(
            () => groupRepo.getAllGroupsWithCompanySize(COMPANY_SIZE),
            "Fetching Groups"
         ),
      ])

      Counter.log(
         `Fetched ${livestreams?.length} livestream and ${groups?.length} groups`
      )

      counter.addToReadCount((livestreams?.length ?? 0) + (groups?.length ?? 0))

      await Promise.all([saveGroups(groups), saveLivestreams(livestreams)])
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const saveGroups = async (groups: Group[]) => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalNumDocs = groups?.length ?? 0

   if (!totalNumDocs)
      return Counter.log(`No Groups to be processed, skipping...`)

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const batchData = groups.slice(i, i + batchSize) // Slice the data into batches

      for (const { id: groupId } of batchData) {
         writeProgressBar.increment() // Increment progress bar

         const groupRef = firestore.collection("careerCenterData").doc(groupId)

         const group = groups.filter((group) => group.id === groupId)

         if (!group) {
            Counter.log(`Group with id ${groupId} does not exist, skipping...`)
            continue
         }

         batch.update(groupRef, {
            companySize: NEW_COMPANY_SIZE,
         })

         counter.writeIncrement() // Increment write counter
      }

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Groups batches committed! :)")
}

const saveLivestreams = async (livestreams: DeepPartial<LivestreamEvent>[]) => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalNumDocs = livestreams?.length

   if (!totalNumDocs)
      return Counter.log(`No Livestreams to be processed, skipping...`)

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const batchData = livestreams.slice(i, i + batchSize) // Slice the data into batches

      for (const livestream of batchData) {
         writeProgressBar.increment() // Increment progress bar

         const livestreamRef = firestore
            .collection("livestreams")
            .doc(livestream.id)


         const companySizes = livestream.companySizes.filter(
            (size) => size !== COMPANY_SIZE
         )

         batch.update(livestreamRef, {
            companySizes: [...new Set([...companySizes, NEW_COMPANY_SIZE])],
         } as Partial<LivestreamEvent>)

         counter.writeIncrement() // Increment write counter
      }

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Livestreams batches committed! :)")
}
