#!/bin/bash

set -e

echo "=== Initial Server Setup ==="

sudo apt-get update
sudo apt-get upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Create project directory
sudo mkdir -p /root/projects/smr-admin-server-ts
sudo chown -R $USER:$USER /root/projects

# Clone repository
cd /root/projects
git clone git@github.com:DiegoB0/smr-admin-server-ts.git

cd smr-admin-server-ts

# Create .env file (update with your values)
cat > .env <<EOF
PORT=
PROD=
FRONTEND_URL=

# Local config
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

# Docker config
# DB_HOST=
# DB_PORT=
# DB_USERNAME=
# DB_PASSWORD=
# DB_NAME=

SEED_LOOKUPS=

# Jwt Config
JWT_SECRET=
JWT_EXPIRES=
EOF

# Start containers
docker compose up -d

echo "=== Setup Complete ==="
