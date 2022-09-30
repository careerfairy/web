import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { groupRepo } from "../../../repositories"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
} from "@careerfairy/shared-lib/dist/groups"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import firebase from "firebase/compat"
import * as fs from "fs"
import config from "../../../config"
import { getArgValue } from "../../../index"

const customCountKeys = {
   numTotalLegacyAdmins: "Total Admins",
   numMainAdmins: "Main Admins",
   numGroups: "Groups",
   numSuccessfulOperations: "Successful Operations",
   numFailedOperations: "Failed Operations",
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
   const clearNewAdmins = getArgValue<"true">("clearNewAdmins")

   try {
      const groups = await groupRepo.getAllGroups()
      const groupsDict = convertDocArrayToDict(groups)

      const groupsLegacyAdminsCountDict = new Map<string, number>() // key: groupId, value: numAdmins

      const legacyAdmins = await groupRepo.getAllLegacyAdmins(true)

      if (clearNewAdmins === "true") {
         // Reset all new admins, so that we can start fresh
         await resetAllNewAdmins(groupsDict)
      }

      const failedMigrationAdmins: {
         targetEmail: string
         newRole: GROUP_DASHBOARD_ROLE | null
         fallbackGroupId: string
         group?: Group
      }[] = []

      counter.addToReadCount(legacyAdmins.length + groups.length)

      counter.setCustomCount(customCountKeys.numFailedOperations, 0) // Initialize to 0

      // Due to collection group query, we need to filter out the admins that are not in the careerCenterData collection
      const legacyGroupAdmins = legacyAdmins.filter(
         (legacyAdmin) =>
            getParentCollectionNameOfLegacyAdmin(legacyAdmin._ref) ===
            "careerCenterData"
      )

      Counter.log("Legacy Group Admins")
      console.table(legacyGroupAdmins) // Log all the legacy admins

      counter.setCustomCount(
         // Set the custom counts
         customCountKeys.numTotalLegacyAdmins,
         legacyGroupAdmins.length
      )

      // Here we are storing the admin count for each group
      legacyGroupAdmins.forEach((groupAdmin) => {
         const groupAdminGroupId = getGroupIdOfLegacyAdminRef(groupAdmin._ref)

         counter.customCountIncrement(
            `Number of roles ${groupAdmin.role || "unKnown role"}`
         )

         const groupAdminCount =
            groupsLegacyAdminsCountDict.get(groupAdminGroupId) || 0

         groupsLegacyAdminsCountDict.set(groupAdminGroupId, groupAdminCount + 1)
      })

      // We will start assigning the roles to the admins

      Counter.log("Starting migrating admin roles")
      for (let i = 0; i < legacyGroupAdmins.length; i++) {
         const groupAdmin = legacyGroupAdmins[i]
         const groupAdminGroupId = getGroupIdOfLegacyAdminRef(groupAdmin._ref)

         const groupAdminCount =
            groupsLegacyAdminsCountDict.get(groupAdminGroupId) || 0

         const newRole =
            groupAdminCount === 1 // If there is only one admin, we will force make them an OWNER
               ? rolesMap.mainAdmin
               : rolesMap[groupAdmin.role] || rolesMap.fallback // Otherwise, we will migrate their current role to the new role system

         const group: Group | undefined = groupsDict[groupAdminGroupId] // We get the group from the group dict, the group could potentially be undefined if the group was deleted

         await groupRepo
            .migrateAdminRole(groupAdmin.id, newRole, groupAdminGroupId, group) // We migrate the admin role
            .then(() =>
               counter.customCountIncrement(
                  customCountKeys.numSuccessfulOperations // If the operation was successful, we increment the successful operations count
               )
            )
            .catch((err) => {
               console.error(err)
               failedMigrationAdmins.push({
                  targetEmail: groupAdmin.id,
                  newRole,
                  fallbackGroupId: groupAdminGroupId,
                  group,
               })
               counter.customCountIncrement(customCountKeys.numFailedOperations) // If the operation failed, we increment the failed operations count
            })
      }

      Counter.log("Finished migrating admin roles")
      if (failedMigrationAdmins.length > 0) {
         // If there are failed operations, we log them
         Counter.log("Failed migration admins")
         console.table(failedMigrationAdmins) // Log all the failed admin migrations

         const dataToWrite = JSON.stringify(failedMigrationAdmins, null, 2)

         fs.writeFile(
            // We write the failed admin migrations to a JSON file
            config.failedAdminMigrationsJsonPath,
            dataToWrite,
            "utf8",
            () =>
               console.log(
                  `Saved failed admin migrations to json file at ${config.failedAdminMigrationsJsonPath}`
               )
         )
      }
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const getParentCollectionNameOfLegacyAdmin = (
   ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
) => {
   return ref.parent.parent.parent.id
}

const getGroupIdOfLegacyAdminRef = (
   ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
) => {
   return ref.parent.parent.id
}

/*
 * In this function, we will clear all the new admins, so that we can start fresh incase we want to re-run this script
 * Does not affect the legacy admins
 * */
const resetAllNewAdmins = async (groupsDict: Record<string, Group>) => {
   const newAdmins = await groupRepo.getAllGroupAdmins(true)

   Counter.log("starting to reset all new admins")
   for (let i = 0; i < newAdmins.length; i++) {
      const newAdmin = newAdmins[i]

      const group = groupsDict[newAdmin.groupId]
      await groupRepo
         .migrateAdminRole(newAdmin.id, null, newAdmin.groupId, group) // We migrate the admin role
         .catch((err) => {
            console.error(err)
         })
   }

   Counter.log("Cleared all new admins")
}
