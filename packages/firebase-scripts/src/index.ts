import confirmScriptSafetyWrapper from "./util/confirmScriptSafetyWrapper"

type ScriptArgs = "useProd" | "scriptPath"

const getArgValue = (targetArg: ScriptArgs) => {
   const argValue = process.argv.find((arg) => arg.startsWith(`${targetArg}=`))
   if (!argValue) {
      return null
   }
   return argValue.split("=")[1]
}

export const useProd = getArgValue("useProd") === "true"
async function run(): Promise<void> {
   const scriptPath = getArgValue("scriptPath")
   if (!scriptPath) {
      throw new Error(`scriptPath is required`)
   }
   try {
      const script = require(scriptPath).default
      console.log("-> Script Execution Started")
      console.time(`${scriptPath}`)
      await confirmScriptSafetyWrapper(script, useProd)
      console.log("-> Script Execution Finished Successfully")
   } catch (e) {
      console.log("-> Script Execution Failed or was Cancelled")
      console.error(e)
   }
   console.timeEnd(`${scriptPath}`)
}
run().catch(console.error)
