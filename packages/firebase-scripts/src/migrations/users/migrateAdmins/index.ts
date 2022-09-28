import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { groupRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
} from "@careerfairy/shared-lib/dist/groups"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

const customCountKeys = {
   numTotalAdmins: "Total Admins",
   numMainAdmins: "Main Admins",
   // numSubAdmins: "Sub Admins",
   // numGroupsWithoutAdmins: "Groups Without Admins",
   numGroups: "Groups",
}

const rolesMap = {
   mainAdmin: GROUP_DASHBOARD_ROLE.OWNER,
   subAdmin: GROUP_DASHBOARD_ROLE.MEMBER,
   [GROUP_DASHBOARD_ROLE.OWNER]: GROUP_DASHBOARD_ROLE.OWNER,
   [GROUP_DASHBOARD_ROLE.MEMBER]: GROUP_DASHBOARD_ROLE.MEMBER,
   fallback: GROUP_DASHBOARD_ROLE.MEMBER,
}

export async function run() {
   const counter = new Counter()

   try {
      const admins = await groupRepo.getAllAdmins(true)
      const groupsAdminsCountDict = new Map<string, number>()
      const groups = await groupRepo.getAllGroups()
      const groupsDict = convertDocArrayToDict(groups)

      // Due to collection group query, we need to filter out the admins that are not in the careerCenterData collection
      const groupAdmins = admins.filter((admin) => {
         const ref = admin._ref
         const parentCollectionName = ref.parent.parent.parent.id
         return parentCollectionName === "careerCenterData"
      })
      console.table(groupAdmins)
      counter.setCustomCount(customCountKeys.numTotalAdmins, groupAdmins.length)

      // return

      // Here we are storing the admin count for each group, if a group only has one admin, we will force make them an OWNER
      groupAdmins.forEach((groupAdmin) => {
         const ref = groupAdmin._ref
         const groupAdminGroupId = ref.parent.parent.id

         counter.customCountIncrement(
            `Number of roles ${groupAdmin.role || "unKnown role"}`
         )

         const groupAdminCount =
            groupsAdminsCountDict.get(groupAdminGroupId) || 0

         groupsAdminsCountDict.set(groupAdminGroupId, groupAdminCount + 1)
      })

      // We will start assigning the roles to the admins

      Counter.log("Starting migrating admin roles")
      for (const groupAdmin of groupAdmins) {
         const ref = groupAdmin._ref
         const groupAdminGroupId = ref.parent.parent.id
         const groupAdminCount =
            groupsAdminsCountDict.get(groupAdminGroupId) || 0

         const newRole =
            groupAdminCount === 1 // If there is only one admin, we will force make them an OWNER
               ? rolesMap.mainAdmin
               : rolesMap[groupAdmin.role] || rolesMap.fallback // Otherwise, we will migrate their role to the new role system

         const group: Group | undefined = groupsDict[groupAdminGroupId]

         await groupRepo
            .migrateAdminRole(groupAdmin.id, newRole, group, groupAdminGroupId)
            .then(() => handleBulkWriterSuccess(counter))
            .catch((err) => handleBulkWriterError(err, counter))

         counter.writeIncrement()
      }
      Counter.log("Finished migrating admin roles")

      counter.addToReadCount(admins.length)
      counter.setCustomCount(counterConstants.numFailedWrites, 0)

      Counter.log("Finished migrating! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
