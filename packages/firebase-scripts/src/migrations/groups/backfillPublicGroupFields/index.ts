import { Group, PublicGroup } from "@careerfairy/shared-lib/src/groups"
import * as cliProgress from "cli-progress"
import { BulkWriter } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

const groupProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Processing Groups", "Groups Processed"),
   cliProgress.Presets.shades_classic
)

/**
 * Function to update sparks group field with the updated public group data
 */
async function updateSparksGroup(
   updatedPublicGroup: PublicGroup,
   group: Group,
   bulkWriter: BulkWriter,
   counter: Counter
) {
   // Retrieve sparks documents related to the group
   const sparksSnap = await firestore
      .collection("sparks")
      .where("group.id", "==", group.id)
      .get()

   // Update each sparks document with the updated public group data
   sparksSnap.forEach((doc) => {
      bulkWriter.update(doc.ref, {
         group: updatedPublicGroup,
      })
   })

   // Increment the counter for migrated sparks
   counter.writeIncrement()
   counter.customCountIncrement("Migrated Sparks")
}

/**
 * Function to update company user followers with the updated public group data
 */
async function updateCompanyUserFollowers(
   updatedPublicGroup: PublicGroup,
   group: Group,
   bulkWriter: BulkWriter,
   counter: Counter
) {
   const querySnapshot = await firestore
      .collectionGroup("companiesUserFollows")
      .where("id", "==", group.id)
      .get()

   querySnapshot.forEach((doc) => {
      bulkWriter.update(doc.ref, {
         group: updatedPublicGroup,
      })
   })

   counter.writeIncrement()
   counter.customCountIncrement("Migrated Company User Followers")
}

const counter = new Counter()

/**
 * Main function to run the migration
 * It retrieves all groups, then updates the public group field in the appropriate collections
 */
export async function run() {
   const bulkWriter = firestore.bulkWriter()

   try {
      const allGroups = await logAction(
         () => groupRepo.getAllGroups(),
         "Fetching all groups"
      )

      counter.addToReadCount(allGroups.length)
      groupProgressBar.start(allGroups.length, 0)

      for (const group of allGroups) {
         const updatedPublicGroup: PublicGroup = {
            id: group.id,
            description: group.description ?? null,
            logoUrl: group.logoUrl ?? null,
            extraInfo: group.extraInfo ?? null,
            universityName: group.universityName ?? null,
            universityCode: group.universityCode ?? null,
            publicSparks: group.publicSparks ?? null,
            publicProfile: group.publicProfile ?? null,
            careerPageUrl: group.careerPageUrl ?? null,
            targetedCountries: group.targetedCountries ?? [],
            targetedUniversities: group.targetedUniversities ?? [],
            targetedFieldsOfStudy: group.targetedFieldsOfStudy ?? [],
            plan: group.plan ?? null,
            companyIndustries: group.companyIndustries ?? [],
            companyCountry: group.companyCountry ?? null,
            companySize: group.companySize ?? null,
            bannerImageUrl: group.bannerImageUrl ?? null,
         }

         await updateSparksGroup(updatedPublicGroup, group, bulkWriter, counter)

         await updateCompanyUserFollowers(
            updatedPublicGroup,
            group,
            bulkWriter,
            counter
         )

         groupProgressBar.increment()
      }

      groupProgressBar.stop()

      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
