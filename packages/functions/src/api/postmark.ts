import * as postmark from "postmark"
import { isLocalEnvironment } from "../util"
let serverToken = "3f6d5713-5461-4453-adfd-71f5fdad4e63"

// on local emulators use the sandbox environment
if (isLocalEnvironment()) {
   serverToken = "40c62a86-6189-432d-b3f8-f25b345184aa"
   console.log(
      "Using postmark sandbox environment, you need to check the sent emails on their dashboard"
   )
}

export const client = new postmark.ServerClient(serverToken)
