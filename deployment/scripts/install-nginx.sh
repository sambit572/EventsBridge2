#!/bin/bash

set -e

echo "Installing Nginx..."

# Update packages
sudo apt update

# Install Nginx
sudo apt install -y nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Start Nginx service
sudo systemctl start nginx

# Check Nginx status
sudo systemctl status nginx --no-pager

echo "Nginx installation completed."

nginx -v