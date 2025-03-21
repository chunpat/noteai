FROM php:8.1-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user
RUN addgroup -g 1000 www && \
    adduser -u 1000 -G www -h /home/www -s /bin/sh -D www

# Install apidoc globally
RUN npm install -g apidoc

# Set working directory and create apidoc directory
WORKDIR /var/www/html
RUN mkdir -p /var/www/html/public/apidoc

# Set permissions
RUN chown -R www:www /var/www

# Switch to non-root user
USER www
