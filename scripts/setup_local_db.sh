#!/bin/bash
set -e

# Ensure secrets directory exists
mkdir -p ./secrets

# Prompt for service account JSON if not present
if [ ! -f ./secrets/service_account.json ]; then
  echo "Please place your GCP service account JSON in ./secrets/service_account.json"
  exit 1
fi

echo "Secrets directory and service account JSON are ready." 