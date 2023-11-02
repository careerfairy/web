#!/bin/bash
set -e

# ./run-locally-with-emulators.sh [folderToImport] [--export-on-exit]

# Firebase functions running locally should connect to emulators
export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"

# NextJS app will read this var to setup emulators
export NEXT_PUBLIC_FIREBASE_EMULATORS="true"

# Check if we have an argument
if [ -z "$1" ]; then
  npx firebase emulators:exec --ui --only firestore,auth,functions "cd src/app; npm run dev"
else
  # Our dataset is big, increase firestore emulator heap
  export JAVA_TOOL_OPTIONS="-Xmx10g"
  ADDITIONAL_ARG=${2:-""} # --export-on-exit

  npx firebase emulators:exec --ui --only firestore,auth,functions $ADDITIONAL_ARG --import "$1" "cd src/app; npm run dev"
fi
