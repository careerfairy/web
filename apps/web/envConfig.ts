import { loadEnvConfig } from "@next/env"

export function loadTestEnv() {
   const projectDir = process.cwd()

   // Save CI-set environment variables that might be overwritten
   const uniqueWorkflowId = process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID

   // Load env config from .env files
   loadEnvConfig(projectDir)

   // Restore CI-set environment variables if they were set
   if (uniqueWorkflowId) {
      process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID = uniqueWorkflowId
   }

   // Debug log in CI to verify environment variables are set correctly
   if (process.env.CI) {
      console.log(
         "ENV check: NEXT_PUBLIC_UNIQUE_WORKFLOW_ID =",
         process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID || "not set"
      )
   }
}
