#!/bin/bash

# Move to the environment folder (one layer down from root)
# shellcheck disable=SC2164
cd environments

# Check if the environment folder and the files exist before copying
if [[ -f "environment.prod.ts" ]]; then
  # Copy content of environment.prod.ts to environment.ts
  cp environment.prod.ts environment.ts
  echo "Production environment setup completed. environment.prod.ts has been copied to environment.ts."
else
  echo "Error: environment.prod.ts not found!"
fi
