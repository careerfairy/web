#!/bin/bash
export EXPO_TUNNEL_SUBDOMAIN="careerfairy-$(openssl rand -hex 4)"
expo start -c --tunnel 