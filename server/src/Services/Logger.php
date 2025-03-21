<?php
declare(strict_types=1);

namespace App\Services;

use Monolog\Logger as MonologLogger;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;
use Monolog\Processor\WebProcessor;
use Slim\Exception\HttpMethodNotAllowedException;

class Logger
{
    private static ?MonologLogger $instance = null;
    private static string $logDir = __DIR__ . '/../../logs';

    public static function getInstance(): MonologLogger
    {
        HttpMethodNotAllowedException
        if (self::$instance === null) {
            // Create logs directory if it doesn't exist
            if (!is_dir(self::$logDir)) {
                mkdir(self::$logDir, 0777, true);
            }

            self::$instance = new MonologLogger('app');

            // Add web processor for request information
            self::$instance->pushProcessor(new WebProcessor());

            // Add daily rotating handlers
            $dateFormat = "Y-m-d H:i:s";
            $output = "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n";
            $formatter = new LineFormatter($output, $dateFormat);

            // Access log handler (all requests)
            $accessHandler = new RotatingFileHandler(
                self::$logDir . '/access.log',
                0, // 0 means unlimited files
                MonologLogger::INFO
            );
            $accessHandler->setFormatter($formatter);
            self::$instance->pushHandler($accessHandler);

            // Error log handler
            $errorHandler = new RotatingFileHandler(
                self::$logDir . '/error.log',
                0,
                MonologLogger::ERROR
            );
            $errorHandler->setFormatter($formatter);
            self::$instance->pushHandler($errorHandler);

            // Add stdout handler for development
            if ($_ENV['APP_ENV'] === 'development') {
                $streamHandler = new StreamHandler('php://stdout', MonologLogger::DEBUG);
                $streamHandler->setFormatter($formatter);
                self::$instance->pushHandler($streamHandler);
            }
        }

        return self::$instance;
    }
}
