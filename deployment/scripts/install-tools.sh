#!/bin/bash

set -e

echo "Updating Ubuntu packages..."

sudo apt update
sudo apt upgrade -y

echo "Installing basic tools..."

sudo apt install -y \
    git \
    curl \
    wget \
    unzip \
    vim \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release

echo "Basic tools installation completed."