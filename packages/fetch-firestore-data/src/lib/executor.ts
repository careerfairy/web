import {
   ChildProcessWithoutNullStreams,
   SpawnOptionsWithoutStdio,
} from "child_process"
import * as spawn from "cross-spawn"
import config from "../config"
import { log } from "./util"

const DRY_RUN = process.env.DRY_RUN

// save global reference for the emulators so that we can close them on CTRL+C
export let currentRunningProcess: ChildProcessWithoutNullStreams

export type CommandOutput = {
   code: number | null
   stdout: string
   stderr: string
}

export function execute(
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

      childProcess.on("close", (code: number) => {
         if (code === 0) {
            resolve({ code, stdout, stderr })
         } else {
            reject({ code, stdout, stderr })
         }
      })
   })
}
