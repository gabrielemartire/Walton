#!/bin/sh
set -e

echo "Starting Walton..."

# Check if package.json exists in the workspace
if [ ! -f "/github/workspace/package.json" ]; then
    echo "Error: package.json not found in the repository root"
    echo "Please ensure your repository has a package.json file with dependencies"
    exit 1
fi

# Copy package.json to walton directory
cp /github/workspace/package.json /walton/package.json

# Check if package-lock.json exists (optional)
if [ -f "/github/workspace/package-lock.json" ]; then
    echo "Found package-lock.json, copying for deeper analysis..."
    cp /github/workspace/package-lock.json /walton/package-lock.json
fi

# Set GitHub token as environment variable if provided
if [ -n "$INPUT_GITHUB_TOKEN" ]; then
    export GITHUB_TOKEN="$INPUT_GITHUB_TOKEN"
    echo "GitHub token configured for API requests"
fi

# Run walton
node /walton/walton.js

echo "Walton analysis completed!"
