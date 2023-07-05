import * as path from "path"
import axios from "axios"
import { readFile } from "fs/promises"
import { existsSync, mkdirSync, rmSync } from "fs"
import config from "./config"
import { debug, h1Text, log } from "./lib/util"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { ChildProcessWithoutNullStreams } from "child_process"
import { CommandOutput, currentRunningProcess, execute } from "./lib/executor"

// save global reference for the emulators so that we can close them on CTRL+C
let emulatorsProcess: ChildProcessWithoutNullStreams

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

   h1Text(`Deleting Auth`)
   await deleteAuth()

   h1Text(`Seeding data`)

   if (config.INCLUDE_USERDATA) {
      h1Text("Re-creating auth users")
      await createAuthUsers()
   }

   await createUser("carlos@careerfairy.io")
   await createUser("habib@careerfairy.io", true)
   await createUser("maximilian@careerfairy.io")
   await createUser("goncalo@careerfairy.io")

   emulatorsProcess.on("exit", () => {
      h1Text(
         `The data is ready to be used! Start your emulators with the arg --import "./${config.LOCAL_FOLDER}/${config.BUCKET_FOLDER}".`
      )

      if (process.platform === "win32") {
         h1Text(`Type CTRL+C to quit, ignore further errors.`)
      }
   })

   await emulatorExport()

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
      await UserSeed.deleteUser(email).catch(console.error) // ensure the user doesn't exist already
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

async function deleteAuth() {
   const rcFile = await readFirebaseRcFile()
   const project = rcFile.projects.default

   debug("Starting deleting auth request", project)
   await axios.delete(
      `http://localhost:9099/emulator/v1/projects/${project}/accounts`
   )
}

async function readFirebaseRcFile() {
   const text = await readFile(path.join(config.rootFolder, ".firebaserc"), {
      encoding: "utf-8",
   })
   return JSON.parse(text)
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
            `./${config.LOCAL_FOLDER}/${config.BUCKET_FOLDER}`,
         ],
         {
            cwd: config.rootFolder,
            env: {
               ...process.env,
               // emulators need a big heap to load the data
               JAVA_TOOL_OPTIONS: process.env.JAVA_TOOL_OPTIONS ?? "-Xmx15g",
            },
         },
         handleProcess
      )
   })
}

// listen to CTRL+c signals
process.on("SIGINT", gracefulShutdown)

function gracefulShutdown(signal: string) {
   log(`${signal} signal received, trying to clear resources.`)
   emulatorsProcess?.kill()
   currentRunningProcess?.kill()
}

function emulatorExport() {
   const fullPath = path.join(
      config.rootFolder,
      config.LOCAL_FOLDER,
      config.BUCKET_FOLDER
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
   } else {
      // remove existing folder since it doesn't overwrite
      rmSync(localDstFolder, { recursive: true, force: true })
      mkdirSync(localDstFolder)
   }

   // download remote folder
   return execute("gsutil", [
      "-m",
      "cp",
      "-r",
      `gs://${config.BUCKET}/${config.BUCKET_FOLDER}`,
      localDstFolder,
   ])
}
