import { groupTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import Counter from "../../../lib/Counter"
import { groupRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import * as cliProgress from "cli-progress"
import { DataWithRef } from "../../../util/types"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { backfillTrigrams } from "../../../util/trigrams"

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing groups batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

type GroupWithRef = DataWithRef<true, Group>
let groups: DataWithRef<true, Group>[]
const bulkWriter = firestore.bulkWriter()

export async function run() {
   try {
      groups = await logAction(
         () => groupRepo.getAllGroups(true),
         "Fetching all groups"
      )

      await backfillTrigrams<GroupWithRef>(
         groups,
         ["universityName"],
         counter,
         bar,
         bulkWriter,
         groupTriGrams,
         "Groups"
      )
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
