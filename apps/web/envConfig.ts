import { loadEnvConfig } from "@next/env"

export function loadTestEnv() {
   const projectDir = process.cwd()
   loadEnvConfig(projectDir)
}
