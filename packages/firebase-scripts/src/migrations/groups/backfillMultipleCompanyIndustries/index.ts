import Counter from "../../../lib/Counter"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import { Group, GroupOption } from "@careerfairy/shared-lib/dist/groups"
import { logAction } from "../../../util/logger"
import * as cliProgress from "cli-progress"
import { DataWithRef } from "../../../util/types"
import { BulkWriter } from "firebase-admin/firestore"
import counterConstants from "../../../lib/Counter/constants"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../../util/bulkWriter"

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing groups batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

let groups: DataWithRef<true, Group>[]
const bulkWriter = firestore.bulkWriter()

export async function run() {
   try {
      groups = await logAction(
         () => groupRepo.getAllGroups(true),
         "Fetching all groups"
      )

      Counter.log(`Fetching all Groups`)
      counter.addToReadCount(groups.length)
      bar.start(groups.length, 0)

      await updateDocuments(groups, counter, bulkWriter)

      await bulkWriter.close()
      bar.stop()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const updateDocuments = (
   groups: Group[],
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   counter.setCustomCount(counterConstants.totalNumDocs, groups.length)
   loopProgressBar.start(groups.length, 0)

   groups.forEach((group, index) => {
      counter.setCustomCount(counterConstants.currentDocIndex, index)
      loopProgressBar.update(index + 1)

      const newCompanyIndustries: GroupOption[] = []
      const singleCompanyIndustryValue = group["companyIndustry"]

      if (singleCompanyIndustryValue) {
         newCompanyIndustries.push(singleCompanyIndustryValue)
      }

      const updatedGroup = {
         ...group,
         companyIndustries: newCompanyIndustries,
      }

      delete updatedGroup["companyIndustry"]

      const groupRef = firestore.collection(`careerCenterData`).doc(group.id)

      bulkWriter
         .set(groupRef, updatedGroup)
         .then(() => handleBulkWriterSuccess(counter))
         .catch((e) => handleBulkWriterError(e, counter))

      counter.writeIncrement()
      counter.customCountIncrement(counterConstants.numSuccessfulWrites)
   })

   loopProgressBar.stop()
}
