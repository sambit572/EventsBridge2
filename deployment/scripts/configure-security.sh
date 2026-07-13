#!/bin/bash

set -e

echo "Configuring server security..."

# Update packages
sudo apt update

# Install firewall and Fail2Ban
sudo apt install -y ufw fail2ban

echo "Configuring UFW firewall..."

# Reset existing firewall rules
sudo ufw --force reset

# Allow SSH access
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

echo "Starting Fail2Ban..."

# Enable Fail2Ban service
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

echo "Security configuration completed."

echo "Firewall status:"
sudo ufw status

echo "Fail2Ban status:"
sudo systemctl status fail2ban --no-pager