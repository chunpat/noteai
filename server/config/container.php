<?php
declare(strict_types=1);

use Psr\Container\ContainerInterface;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Services\Auth;
use App\Services\OpenAI;
use Predis\Client as RedisClient;
use Psr\Log\LoggerInterface;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Middleware\ContentLengthMiddleware;
use App\Services\LogService;
use App\Middleware\ErrorHandlerMiddleware;
use App\Middleware\AuthenticationMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\ApiLoggerMiddleware;

return [
    // PDO Database connection
    PDO::class => function (ContainerInterface $container) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            $_ENV['DB_HOST'],
            $_ENV['DB_PORT'],
            $_ENV['DB_DATABASE']
        );
        return new PDO(
            $dsn, 
            $_ENV['DB_USERNAME'], 
            $_ENV['DB_PASSWORD'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    },

    // Auth service
    Auth::class => function (ContainerInterface $container) {
        return new Auth($container->get(PDO::class));
    },

    // Database configuration (Eloquent)
    Capsule::class => function (ContainerInterface $container) {
        $capsule = new Capsule;
        $capsule->addConnection([
            'driver'    => 'mysql',
            'host'      => $_ENV['DB_HOST'],
            'port'      => $_ENV['DB_PORT'],
            'database'  => $_ENV['DB_DATABASE'],
            'username'  => $_ENV['DB_USERNAME'],
            'password'  => $_ENV['DB_PASSWORD'],
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
        ]);
        
        $capsule->setAsGlobal();
        $capsule->bootEloquent();
        
        return $capsule;
    },

    // Redis configuration
    RedisClient::class => function (ContainerInterface $container) {
        return new RedisClient([
            'scheme' => 'tcp',
            'host'   => $_ENV['REDIS_HOST'],
            'port'   => (int) $_ENV['REDIS_PORT'],
            'password' => $_ENV['REDIS_PASSWORD'] ?? null,
        ]);
    },

    // 基础日志记录器
    LoggerInterface::class => function () {
        $loggerFactory = require __DIR__ . '/logger.php';
        return $loggerFactory('app');
    },
    
    // 专用日志记录器
    'api.logger' => function () {
        $loggerFactory = require __DIR__ . '/logger.php';
        return $loggerFactory('api');
    },
    
    'auth.logger' => function () {
        $loggerFactory = require __DIR__ . '/logger.php';
        return $loggerFactory('auth');
    },
    
    'error.logger' => function () {
        $loggerFactory = require __DIR__ . '/logger.php';
        return $loggerFactory('error');
    },
    
    // 日志服务
    LogService::class => function (ContainerInterface $container) {
        return new LogService(
            $container->get(LoggerInterface::class),
            $container->get('api.logger'),
            $container->get('auth.logger'),
            $container->get('error.logger')
        );
    },
    
    // 响应工厂
    ResponseFactory::class => function () {
        return new ResponseFactory();
    },
    
    // 中间件定义
    ErrorHandlerMiddleware::class => function (ContainerInterface $container) {
        return new ErrorHandlerMiddleware(
            $container->get(LogService::class),
            $container->get(ResponseFactory::class),
            filter_var($_ENV['APP_DEBUG'], FILTER_VALIDATE_BOOLEAN)
        );
    },

    AuthenticationMiddleware::class => function (ContainerInterface $container) {
        return new AuthenticationMiddleware(
            $container->get(Auth::class)
        );
    },

    ApiLoggerMiddleware::class => function (ContainerInterface $container) {
        return new ApiLoggerMiddleware(
            $container->get(LogService::class)
        );
    },

    CorsMiddleware::class => function () {
        return new CorsMiddleware();
    },

    ContentLengthMiddleware::class => function () {
        return new ContentLengthMiddleware();
    },

    // OpenAI service
    OpenAI::class => function () {
        return new OpenAI();
    }
];
