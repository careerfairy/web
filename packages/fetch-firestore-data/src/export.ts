import config from "./config"
import { execute } from "./lib/executor"
import { debug, h1Text, log } from "./lib/util"
import { type ProjectCollectionId } from "@careerfairy/shared-lib/dist/constants/collections"

/**
 * Export Firestore collections into a Bucket `fetched`
 * Can take around 5 minutes to complete
 */
async function exportCollections() {
   let collections = config.COLLECTION_IDS
   if (config.INCLUDE_USERDATA === false) {
      collections = filterCollectionsWithUserData(collections)
   }

   if (collections.length > 60) {
      throw new Error(
         "gcloud only allows export a max of 60 collection ids, remove some.."
      )
   }

   const bucket = `${config.BUCKET}/${config.BUCKET_FOLDER}`

   // clear temp folder
   try {
      h1Text(`Clearing existing bucket ${bucket} contents`)

      await execute("gsutil", ["-m", "rm", "-r", `gs://${bucket}`])
   } catch (e) {
      debug(e)
      log("No tmp folder to clear")
   }

   h1Text(
      `Exporting the ${collections.length} collections to bucket: ${bucket}`
   )

   log("This operation can take 5 minutes..")

   await execute("gcloud", [
      "firestore",
      "export",
      `gs://${bucket}`,
      `--collection-ids=${collections.join(",")}`,
   ])

   h1Text("Export completed with success!")
   log(
      `You can run the following command to download the backup to your emulators:`
   )
   log(`npm run start -w @careerfairy/fetch-firestore-data`)
}

/**
 * Remove collections with user data
 */
function filterCollectionsWithUserData(collectionIds: ProjectCollectionId[]) {
   const toRemove: ProjectCollectionId[] = [
      "userData",
      "userLivestreamData",
      "participatingStats",
   ]

   return collectionIds.filter((elem) => {
      return toRemove.includes(elem) === false
   })
}

exportCollections().catch((e) => log("Failed to export!", e))
