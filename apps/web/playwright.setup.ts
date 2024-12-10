import { loadTestEnv } from "./envConfig"

async function globalSetup() {
   // Load test environment variables before running Playwright tests
   loadTestEnv()
}

export default globalSetup
