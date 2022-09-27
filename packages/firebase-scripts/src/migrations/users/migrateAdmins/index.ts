import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
// import {
//    Group,
//    GROUP_DASHBOARD_ROLE,
// } from "@careerfairy/shared-lib/dist/groups"
import { throwMigrationError } from "../../../util/misc"
import { groupRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"

// const customCountKeys = {
//    numTotalAdmins: "Total Admins",
//    numMainAdmins: "Main Admins",
//    numSubAdmins: "Sub Admins",
//    numGroupsWithoutAdmins: "Groups Without Admins",
//    numGroups: "Groups",
// }
//
// type GroupsDict = Record<Group["id"], Group>
//
// const rolesMap = {
//    mainAdmin: GROUP_DASHBOARD_ROLE.OWNER,
//    subAdmin: GROUP_DASHBOARD_ROLE.MEMBER,
//    fallback: GROUP_DASHBOARD_ROLE.MEMBER,
// }
export async function run() {
   const counter = new Counter()

   try {
      const bulkWriter = firestore.bulkWriter()
      const admins = await groupRepo.getAllAdmins()
      const authUsers = await groupRepo.getAllAuthUsers()
      console.log("-> authUsers", authUsers)
      // console.log("-> admins", admins)
      // const groups = await groupRepo.g<etAllGroups()
      // const groupsDict = convertDocArrayToDict(groups)
      counter.addToReadCount(admins.length)
      counter.setCustomCount(counterConstants.numFailedWrites, 0)

      Counter.log("Committing all writes...")
      writeProgressBar.start(
         counter.write(),
         counter.getCustomCount(counterConstants.numSuccessfulWrites)
      )

      /*
       * Commits all enqueued writes and marks the BulkWriter instance as closed.
       * After calling close(), calling any method will throw an error.
       * Any retries scheduled as part of an onWriteError() handler will
       * be run before the close() promise resolves.
       * */
      await bulkWriter.close()
      writeProgressBar.stop()

      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
