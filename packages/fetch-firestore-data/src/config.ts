import { type ProjectCollectionId } from "@careerfairy/shared-lib/constants/collections"
import * as path from "path"

export default {
   /**
    * Remote folder that we want to fetch
    * Should be updated from time to time using the export.ts script
    */
   BUCKET_FOLDER: "fetched",

   BUCKET: "careerfairy-backup",

   /**
    * Relative to the project root, data will be extracted into this folder
    */
   LOCAL_FOLDER: "emulatorData",

   // dist/fetch-firestore-data/src -> go up 5 levels to reach repo root
   rootFolder: path.join(__dirname, "../../../../../"),

   /*
    * Only set this to true if you want to fetch the user data from the production database,
    * but be sure to delete the downloaded backup when done testing because of GDPR
    *
    * When false, during the export script, some collections with user data will not be exported
    * */
   INCLUDE_USERDATA: process.env.INCLUDE_USERDATA === "true",

   /**
    * The firestore collections that will be exported from production and
    * imported to the emulators
    *
    * Minimal set for local development (reduced from 59 to 16 collections)
    * This includes CRITICAL + IMPORTANT collections for 95% functionality
    *
    * The collection id can be a parent collection or subcollection
    * MAX of 60
    */
   COLLECTION_IDS: [
      // CRITICAL - Core functionality (8)
      "userData", // User profiles/accounts
      "livestreams", // Events/streaming (13+ sub-collections)
      "draftLivestreams", // Draft events
      "careerCenterData", // Companies/groups (4 sub-collections)
      "sparks", // Social content feed
      "userLivestreamData", // User event registration/participation
      "interests", // Reference data for filtering
      "fieldsOfStudy", // Reference data + levelsOfStudy sub-collection
      "levelsOfStudy", // Reference data for filtering
      "creators", // Creators

      // IMPORTANT - Key features (12)
      "questions", // Q&A during livestreams
      "polls", // Polling/voting
      "customJobs", // Job postings (3 sub-collections)
      "jobApplications", // Job applications
      "admins", // Admins
      "customJobStats", // Custom job stats
      "groupAdmins", // Group admins
      "presentations", // Presentations
      "callToActions", // Call to actions
      "universitiesByCountry", // Universities by country
   ] as ProjectCollectionId[],
}
