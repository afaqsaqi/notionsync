#!/bin/bash

# Set the domain
DOMAIN=earendeltechnologies.com
EMAIL=afaqahmad6296@gmail.com

# Check if certificates exist, if not, request new ones
echo "Step 1: checking if certificates available" >> /var/log/eb-script.log
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "DEBUG: certificate not found" >> /var/log/eb-script.log
    echo "Certificates not found. Requesting certificates from Let's Encrypt..."
    certbot certonly --standalone --non-interactive --agree-tos --email $EMAIL -d $DOMAIN -d www.$DOMAIN -v
else
    echo "DEBUG: Certificates found. No need to request new ones." >> /var/log/eb-script.log
    echo "Certificates found. No need to request new ones."
fi

while :; do
    echo "Step 1: checking if certificates available" >> /var/log/eb-script.log
    certbot renew --quiet
    docker compose --down
    docker compose --up
    sleep 12h
done
