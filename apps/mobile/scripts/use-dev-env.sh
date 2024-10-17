#!/bin/bash

# Move to the environment folder (one layer down from root)
# shellcheck disable=SC2164
cd environments

# Check if the environment folder and the files exist before copying
if [[ -f "environment.dev.ts" ]]; then
  # Copy content of environment.prod.ts to environment.ts
  cp environment.dev.ts environment.ts
  echo "Development environment setup completed. environment.dev.ts has been copied to environment.ts."
else
  echo "Error: environment.dev.ts not found!"
fi
