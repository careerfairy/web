#!/bin/bash

# On Android, the remote URL for the Expo development server defaults to our package name
# (com.admin_product_team.careerfairymobileapp) as the domain for the Ngrok URL. However,
# the underscore in our package name causes a crash. This script fixes the issue by
# generating a remote domain without underscores and ensuring unique URLs to prevent
# collisions when multiple developers share Expo builds.
export EXPO_TUNNEL_SUBDOMAIN="careerfairy-$(openssl rand -hex 4)"

expo start -c --tunnel 