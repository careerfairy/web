import * as path from "path"

export default {
   /**
    * Remote folder that we want to fetch
    * Should be updated from time to time
    */
   BUCKET_FOLDER: "Mon Aug 15 2022-12:18:04 GMT+0000 (Coordinated Universal Time)",

   BUCKET: "careerfairy-backup",

   /**
    * Relative to the project root, data will be extracted into this folder
    */
   LOCAL_FOLDER: "emulatorData",

   finalBackupFolder: "fetched",
   rootFolder: path.join(__dirname, "../../../"),
}
