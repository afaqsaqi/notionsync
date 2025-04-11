FROM nginx:alpine

# Install Certbot and dependencies
RUN apk add --no-cache \
    certbot \
    bash \
    curl \
    openssl \
    && rm -rf /var/cache/apk/*

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["./entrypoint.sh"]