import * as path from "path"
import {
   ChildProcessWithoutNullStreams,
   SpawnOptionsWithoutStdio,
} from "child_process"
import axios from "axios"
import { readFile } from "fs/promises"
import { existsSync, mkdirSync } from "fs"
import UserSeed from "@careerfairy/seed-data/dist/users"
import config from "./config"
import * as spawn from "cross-spawn"

const DEBUG = process.env.DEBUG
const DRY_RUN = process.env.DRY_RUN

// save global reference for the emulators so that we can close them on CTRL+C
let emulatorsProcess: ChildProcessWithoutNullStreams
let currentRunningProcess: ChildProcessWithoutNullStreams

/*
 * Only set this to true if you want to fetch the user data from the production database,
 * but be sure to delete the downloaded backup when done testing because of GDPR
 * */
const INCLUDE_USERDATA = false

/**
 * Main logic
 *
 * Not catching exceptions on purpose, we should look into the error and fix it
 */
async function run(): Promise<void> {
   h1Text(`Starting downloading remote backup: ${config.BUCKET_FOLDER}`)
   await downloadRemoteBucket()

   h1Text(`Starting the local emulators`)
   emulatorsProcess = await runEmulatorsInBackground()
   h1Text(`Emulators ready to receive commands`)

   // gdpr, delete production user data
   const collectionsToRemove = INCLUDE_USERDATA
      ? ["users"]
      : ["users", "userData"]

   h1Text(`Removing collections: ${collectionsToRemove.join(",")}`)
   await removeExistingCollections(collectionsToRemove)

   h1Text(`Deleting Auth`)
   await deleteAuth()

   h1Text(`Seeding data`)

   if (INCLUDE_USERDATA) {
      h1Text("Re-creating auth users")
      await createAuthUsers()
   }

   await createUser("carlos@careerfairy.io")
   await createUser("habib@careerfairy.io", true)
   await createUser("maximilian@careerfairy.io")
   await createUser("goncalo@careerfairy.io")

   await emulatorExport()

   emulatorsProcess.on("exit", () => {
      h1Text(
         `The data is ready to be used! Start your emulators with the arg --import "./${config.LOCAL_FOLDER}/${config.finalBackupFolder}".`
      )

      if (process.platform === "win32") {
         h1Text(`Type CTRL+C to quit, ignore further errors.`)
      }
   })

   emulatorsProcess.kill()
}

run().catch(console.error)

/**
 * Create a user, skip if already exists
 * @param email
 * @param superAdmin - if true, create a CF super admin user
 */
async function createUser(email: string, superAdmin: boolean = false) {
   try {
      return await UserSeed.createUser(email, { isAdmin: superAdmin })
   } catch (e) {
      if (e.errorInfo?.code === "auth/email-already-exists") {
         return null
      } else {
         h1Text(e)
      }

      throw e
   }
}
/**
 * Create creates all the auth users based on the userData docs
 */
async function createAuthUsers() {
   try {
      return await UserSeed.createAuthUsersFromUserData()
   } catch (e) {
      h1Text(e)
      throw e
   }
}

/**
 * Deletes collections from the emulators
 * This may take a while for big collections! (the emulators are slow)
 *
 * @param collections
 */
async function removeExistingCollections(collections: string[]) {
   const rcFile = await readFirebaseRcFile()
   const project = rcFile.projects.default

   for (let i = 0; i < collections.length; i++) {
      debug("Starting deleting collection request", project, collections[i])
      await axios.delete(
         `http://localhost:8080/emulator/v1/projects/${project}/databases/(default)/documents/${collections[i]}`
      )
   }
}

async function deleteAuth() {
   const rcFile = await readFirebaseRcFile()
   const project = rcFile.projects.default

   debug("Starting deleting auth request", project)
   await axios.delete(
      `http://localhost:9099/emulator/v1/projects/${project}/accounts`
   )
}

function readFirebaseRcFile() {
   return readFile(path.join(config.rootFolder, ".firebaserc"), {
      encoding: "utf-8",
   }).then(JSON.parse)
}

/**
 * Keeps the emulators running in the background
 *
 * Resolves when they're ready to receive requests
 * Needs to be manually killed
 */
async function runEmulatorsInBackground(): Promise<ChildProcessWithoutNullStreams> {
   return new Promise((resolve, reject) => {
      const handleProcess = (childProcess: ChildProcessWithoutNullStreams) => {
         let resolved = false

         childProcess.stdout?.on("data", (data: any) => {
            const msg = data.toString()

            if (
               msg.indexOf(
                  "All emulators ready! It is now safe to connect your app."
               ) !== -1
            ) {
               // emulators ready to be used!
               resolved = true
               resolve(childProcess)
            }
         })

         // shouldn't get here if all goes well, this is only reached when manually killed
         childProcess.on("close", (code) => {
            debug("Emulators shutting down!")
            if (!resolved) {
               reject(code)
            }
         })
      }
      execute(
         "npx",
         [
            "firebase",
            "emulators:start",
            "--only",
            "firestore,auth",
            "--import",
            `./${config.LOCAL_FOLDER}/${config.finalBackupFolder}`,
         ],
         {
            cwd: config.rootFolder,
            env: {
               ...process.env,
               // emulators need a big heap to load the data
               JAVA_TOOL_OPTIONS: "-Xmx25g",
            },
         },
         handleProcess
      )
   })
}

// listen to CTRL+c signals
process.on("SIGINT", gracefulShutdown)

function gracefulShutdown(signal) {
   log(`${signal} signal received, trying to clear resources.`)
   emulatorsProcess?.kill()
   currentRunningProcess?.kill()
}

function emulatorExport() {
   const fullPath = path.join(
      config.rootFolder,
      config.LOCAL_FOLDER,
      config.finalBackupFolder
   )
   return axios.post("http://localhost:4400/_admin/export", {
      path: fullPath,
   })
}

/**
 * Downloads a remote bucket into a local folder
 *
 * Internally copies the remote folder into a temporary folder to change its name
 * This is required because the current folder names have invalid windows chars
 */
async function downloadRemoteBucket(): Promise<CommandOutput> {
   const localDstFolder = path.join(config.rootFolder, config.LOCAL_FOLDER)

   // create local folder if it doesn't exist
   if (!existsSync(localDstFolder)) {
      mkdirSync(localDstFolder)
   }

   // clear temp folder
   try {
      await execute("gsutil", [
         "-m",
         "rm",
         "-r",
         `gs://${config.BUCKET}/${config.finalBackupFolder}`,
      ])
   } catch (e) {
      debug(e)
      log("No tmp folder to clear")
   }

   // copy remote folder into the tmp folder
   await execute("gsutil", [
      "cp",
      "-r",
      `gs://${config.BUCKET}/${config.BUCKET_FOLDER}`,
      `gs://${config.BUCKET}/${config.finalBackupFolder}`,
   ])

   // rename backup file
   await execute("gsutil", [
      "mv",
      `gs://${config.BUCKET}/${config.finalBackupFolder}/${config.BUCKET_FOLDER}.overall_export_metadata`,
      `gs://${config.BUCKET}/${config.finalBackupFolder}/backup.overall_export_metadata`,
   ])

   // download remote folder
   return execute("gsutil", [
      "-m",
      "cp",
      "-r",
      `gs://${config.BUCKET}/${config.finalBackupFolder}`,
      localDstFolder,
   ])
}

type CommandOutput = { code: number | null; stdout: string; stderr: string }

function execute(
   command: string,
   args: string[] = [],
   opts: SpawnOptionsWithoutStdio = { cwd: config.rootFolder },
   processListenerFn?: (childProcess: ChildProcessWithoutNullStreams) => void
): Promise<CommandOutput> {
   return new Promise((resolve, reject) => {
      if (DRY_RUN) {
         log(command, args)
         return resolve({
            code: 0,
            stdout: "dry run stdout",
            stderr: "dry run stderr",
         })
      }

      const childProcess = spawn(command, args, opts)
      currentRunningProcess = childProcess

      if (processListenerFn) {
         // let outsiders send signals and listen to this process events
         processListenerFn(childProcess)
      }

      let stdout: string = ""
      let stderr: string = ""

      childProcess.stdout?.on("data", (data: any) => {
         try {
            stdout += data.toString()
         } catch (e) {}
         process.stdout.write(data)
      })
      childProcess.stderr?.on("data", (data: any) => {
         try {
            stderr += data.toString()
         } catch (e) {}
         process.stderr.write(data)
      })

      childProcess.on("close", (code) => {
         if (code === 0) {
            resolve({ code, stdout, stderr })
         } else {
            reject({ code, stdout, stderr })
         }
      })
   })
}

function h1Text(text: string) {
   // cyan color
   console.log("\x1b[36m%s\x1b[0m", `# ${text}`)
}

function log(...args) {
   console.log(...args)
}

function debug(...args) {
   if (DEBUG) {
      console.log(...args)
   }
}
