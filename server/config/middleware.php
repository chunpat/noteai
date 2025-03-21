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

    // 中间件注册顺序很重要：先添加的最后执行（最外层）
    $middlewares = [
        // API日志记录（最内层）
        ApiLoggerMiddleware::class,
        
        // 内容长度处理
        ContentLengthMiddleware::class,

        // 内容长度处理
        ApiConfigMiddleware::class,
        
        // // 认证中间件
        // AuthenticationMiddleware::class,
        
        // CORS处理
        CorsMiddleware::class,
        
        // 错误处理（最外层，必须最后注册）
        ErrorHandlerMiddleware::class
    ];

    // Body解析中间件 - 最内层，让其他中间件可以访问解析后的请求体
    $app->addBodyParsingMiddleware();

    // 注册中间件
    foreach ($middlewares as $middleware) {
        $app->add($container->get($middleware));
    }
};
