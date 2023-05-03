import Counter from "../../../lib/Counter"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import { Group, GroupOption } from "@careerfairy/shared-lib/dist/groups"
import { logAction } from "../../../util/logger"
import * as cliProgress from "cli-progress"
import { DataWithRef } from "../../../util/types"
import { BulkWriter, FieldValue } from "firebase-admin/firestore"
import counterConstants from "../../../lib/Counter/constants"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../../util/bulkWriter"

const WRITE_BATCH = 50
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

      counter.addToReadCount(groups.length)
      bar.start(groups.length, 0)

      await updateDocuments(counter, bulkWriter)

      await bulkWriter.close()
      bar.stop()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const updateDocuments = async (counter: Counter, bulkWriter: BulkWriter) => {
   counter.setCustomCount(counterConstants.totalNumDocs, groups.length)
   loopProgressBar.start(groups.length, 0)

   let index = 0
   for (const group of groups) {
      counter.setCustomCount(counterConstants.currentDocIndex, index)
      loopProgressBar.update(index + 1)

      const newCompanyIndustries: GroupOption[] = []
      const singleCompanyIndustryValue = group["companyIndustry"]

      if (singleCompanyIndustryValue) {
         newCompanyIndustries.push(singleCompanyIndustryValue)
      }

      const updatedGroup = {
         companyIndustries: newCompanyIndustries,
         companyIndustry: FieldValue.delete(),
      }

      delete updatedGroup["companyIndustry"]

      bulkWriter
         .update(group._ref as any, updatedGroup)
         .then(() => handleBulkWriterSuccess(counter))
         .catch((e) => handleBulkWriterError(e, counter))

      counter.writeIncrement()
      counter.customCountIncrement(counterConstants.numSuccessfulWrites)

      if (index % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }

      index++
   }

   await bulkWriter.flush()
   loopProgressBar.stop()
}
