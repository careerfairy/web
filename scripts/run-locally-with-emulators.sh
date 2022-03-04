#!/bin/bash

set -e

# Firebase functions running locally should connect to emulators
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export FIRESTORE_EMULATOR_HOST="localhost:8080"

# NextJS app will read this var to setup emulators
export NEXT_PUBLIC_FIREBASE_EMULATORS="true"

# Check if we have an argument
if [ -z "$1" ]; then
  npx firebase emulators:exec --ui --only firestore,auth,functions "cd src/app; npm run dev"
else
  # Our dataset is big, increase firestore emulator heap
  export JAVA_TOOL_OPTIONS="-Xmx7g"

  npx firebase emulators:exec --ui --only firestore,auth,functions --import "$1" "cd src/app; npm run dev"
fi
