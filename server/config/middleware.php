<?php
declare(strict_types=1);

use App\Middleware\ApiConfigMiddleware;
use DI\Container;
use Slim\App;
use Slim\Middleware\ContentLengthMiddleware;
use App\Middleware\AuthenticationMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\ErrorHandlerMiddleware;
use App\Middleware\ApiLoggerMiddleware;

return function (App $app) {
    /** @var Container $container */
    $container = $app->getContainer();

    // CORS middleware should be registered first, before any other middleware
    $app->add($container->get(CorsMiddleware::class));
    
    // Other middlewares
    $middlewares = [
        // API日志记录
        ApiLoggerMiddleware::class,
        
        // 内容长度处理
        ContentLengthMiddleware::class,

        // 内容长度处理
        ApiConfigMiddleware::class,
        
        // 认证中间件
        AuthenticationMiddleware::class,
        
        // 错误处理
        ErrorHandlerMiddleware::class
    ];

    // Body解析中间件 - 最内层，让其他中间件可以访问解析后的请求体
    $app->addBodyParsingMiddleware();

    // 注册中间件
    foreach ($middlewares as $middleware) {
        $app->add($container->get($middleware));
    }
};
