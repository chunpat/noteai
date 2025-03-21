# PHP Slim Framework Template

A lightweight and extensible PHP API framework template built with Slim 4, PHP-DI, and other modern PHP components.

## Features

- Built on Slim 4 Framework
- PSR-7 HTTP message interfaces
- PSR-11 Dependency injection container
- PSR-15 Middleware support
- Built-in error handling
- CORS support
- JSON response formatting
- Logging system (Monolog)
- Database support (Eloquent ORM)
- Redis support
- Environment configuration
- Docker support

## Requirements

- PHP 8.1 or newer
- Composer
- MySQL 5.7 or newer (optional)
- Redis (optional)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
# Using PHP's built-in server
php -S localhost:8080 -t public

# Or using Docker
docker-compose up -d
```

## Project Structure

```
.
├── config/                 # Configuration files
│   ├── container.php      # Dependency injection container
│   ├── middleware.php     # Middleware configuration
│   ├── routes.php         # Route definitions
│   └── logger.php         # Logging configuration
├── src/
│   ├── Actions/           # Action classes (endpoints)
│   ├── Constants/         # Constants and enums
│   ├── Exceptions/        # Custom exceptions
│   ├── Middleware/        # Custom middleware
│   ├── Models/            # Database models
│   ├── Services/          # Business logic
│   └── Validators/        # Request validators
├── public/                # Web root
│   └── index.php         # Application entry point
├── logs/                  # Log files
├── docker/               # Docker configuration
├── .env.example          # Environment template
├── composer.json         # Composer dependencies
└── docker-compose.yml    # Docker compose config
```

## Creating New Endpoints

1. Create a new Action class in `src/Actions/`:

```php
<?php
declare(strict_types=1);

namespace App\Actions\YourNamespace;

use App\Actions\AbstractAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class YourAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        // Your logic here
        return $this->respondWithData([
            'key' => 'value'
        ]);
    }
}
```

2. Add your route in `config/routes.php`:

```php
$app->group('/api/v1', function ($group) {
    $group->get('/your-endpoint', \App\Actions\YourNamespace\YourAction::class);
});
```

## Error Handling

The framework includes a standardized error response format:

```json
{
    "error_code": 400,
    "error_msg": "Bad Request",
    "data": {}
}
```

Use the built-in error codes in `src/Constants/ErrorCode.php` for consistent error handling.

## Middleware

Add custom middleware in `src/Middleware/` and register them in `config/middleware.php`.

Example middleware registration:

```php
$middlewares = [
    YourMiddleware::class,
    // other middleware...
];
```

## Environment Configuration

Key environment variables:

```
APP_ENV=development
APP_DEBUG=true

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=null
```

## Example API Endpoints

1. Health Check:
```
GET /health
Response: {"status": "healthy"}
```

2. Hello World:
```
GET /api/v1/hello?name=John
Response: {"error_code":0,"error_msg":"Success","data":{"message":"Hello, John!","timestamp":"2025-03-17 17:39:58"}}
```

## Testing

You can test the API using tools like cURL, Postman, or any HTTP client.

Example with cURL:
```bash
# Health check
curl http://localhost:8080/health

# Hello world
curl http://localhost:8080/api/v1/hello?name=John
```

## Contributing

1. Follow PSR-12 coding standards
2. Create feature branches
3. Write meaningful commit messages
4. Add tests if applicable
5. Submit pull requests

## License

MIT License
