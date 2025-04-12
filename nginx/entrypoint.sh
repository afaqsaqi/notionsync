#!/bin/bash

# Set the domain
DOMAIN=earendeltechnologies.com
EMAIL=afaqahmad6296@gmail.com

# Start Nginx in the background
nginx -s stop
echo "Checking Port 80"
sudo lsof -i :80

echo "Checking resolution of domain"
dig $DOMAIN
dig www.$DOMAIN

# Check if certificates exist, if not, request new ones
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "Certificates not found. Requesting certificates from Let's Encrypt..."
    certbot certonly --standalone --non-interactive --agree-tos --email $EMAIL -d $DOMAIN -d www.$DOMAIN -v
    # Reload Nginx to apply certificates
    nginx -s reload
else
    echo "Certificates found. No need to request new ones."
fi

nginx 
# Set up Certbot to auto-renew the certificates every 12 hours
while :; do
    certbot renew --quiet
    nginx -s reload
    sleep 12h
done
