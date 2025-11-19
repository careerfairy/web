import { loadEnvConfig } from "@next/env"

export function loadTestEnv() {
   const projectDir = process.cwd()

   // Save CI-set environment variables that might be overwritten
   const workflowId = process.env.WORKFLOW_ID

   // Load env config from .env files
   loadEnvConfig(projectDir)

   // Restore CI-set environment variables if they were set
   if (workflowId) {
      process.env.WORKFLOW_ID = workflowId
   }

   // Debug log in CI to verify environment variables are set correctly
   if (process.env.CI) {
      console.log(
         "ENV check: WORKFLOW_ID =",
         process.env.WORKFLOW_ID || "not set"
      )
   }
}
