#!/bin/bash
set -e

# Generate unique workflow ID similar to CI
# Format: uuidgen output + optional shard number
if [ -z "$WORKFLOW_ID" ]; then
   # Extract shard number from arguments if present (e.g., --shard=1/5)
   # Need to look through all arguments recursively in case they're nested
   SHARD_NUM=""
   for arg in "$@"; do
      if [[ $arg == *--shard=* ]]; then
         # Extract shard number (e.g., "1" from "--shard=1/5")
         SHARD_NUM=$(echo "$arg" | sed -n 's/.*--shard=\([0-9]*\)\/.*/\1/p')
         [ -n "$SHARD_NUM" ] && break
      fi
   done
   
   if [ -n "$SHARD_NUM" ]; then
      export WORKFLOW_ID="$(uuidgen)-${SHARD_NUM}"
   else
      export WORKFLOW_ID="$(uuidgen)"
   fi
fi

# Execute test command, forwarding any additional arguments to npm
exec npm run test:e2e-webapp "$@"

