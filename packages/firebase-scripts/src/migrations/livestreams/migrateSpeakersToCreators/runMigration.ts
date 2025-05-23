#!/usr/bin/env ts-node

import { run } from "./index"

// Simple runner script for the migration
run()
   .then(() => {
      console.log("Migration completed successfully!")
      process.exit(0)
   })
   .catch((error) => {
      console.error("Migration failed:", error)
      process.exit(1)
   })
