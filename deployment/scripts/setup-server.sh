#!/bin/bash

set -e

echo "================================="
echo "EventsBridge Server Setup Started"
echo "================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running basic tools installation..."
bash "$SCRIPT_DIR/install-tools.sh"

echo "Running Docker installation..."
bash "$SCRIPT_DIR/install-docker.sh"

echo "Running Nginx installation..."
bash "$SCRIPT_DIR/install-nginx.sh"

echo "Running security configuration..."
bash "$SCRIPT_DIR/configure-security.sh"

echo "================================="
echo "EventsBridge Server Setup Completed"
echo "================================="