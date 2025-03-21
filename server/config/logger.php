<?php
declare(strict_types=1);

use Monolog\Level;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\LineFormatter;
use Monolog\Processor\IntrospectionProcessor;
use Monolog\Processor\WebProcessor;
use Monolog\Processor\MemoryUsageProcessor;

return function (string $name = 'app') {
    $logLevel = match (strtolower(env('LOG_LEVEL', 'debug'))) {
        'debug' => Level::Debug,
        'info' => Level::Info,
        'notice' => Level::Notice,
        'warning' => Level::Warning,
        'error' => Level::Error,
        'critical' => Level::Critical,
        'alert' => Level::Alert,
        'emergency' => Level::Emergency,
        default => Level::Debug,
    };

    // 创建日志实例
    $logger = new Logger($name);

    // 日期格式
    $dateFormat = "Y-m-d H:i:s";
    
    // 日志格式
    $output = "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n";
    $formatter = new LineFormatter($output, $dateFormat, true, true);

    // 根据环境配置不同的处理器
    if (env('APP_ENV', 'production') === 'development') {
        // 开发环境: 输出到控制台
        $streamHandler = new StreamHandler('php://stdout', $logLevel);
        $streamHandler->setFormatter($formatter);
        $logger->pushHandler($streamHandler);
    }

    // 所有环境: 文件日志
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }

    // 按日期轮转的文件处理器
    $rotatingHandler = new RotatingFileHandler(
        $logDir . '/' . $name . '.log',
        30, // 保留30天
        $logLevel,
        true, // 文件权限
        0664  // 文件权限模式
    );
    $rotatingHandler->setFormatter($formatter);
    $logger->pushHandler($rotatingHandler);

    // 添加处理器
    $logger->pushProcessor(new IntrospectionProcessor($logLevel)); // 添加调用文件和行号
    $logger->pushProcessor(new WebProcessor());                    // 添加请求信息
    $logger->pushProcessor(new MemoryUsageProcessor());            // 添加内存使用信息

    return $logger;
}; 