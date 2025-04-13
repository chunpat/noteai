<?php

use App\Services\LogService;

if (!function_exists('logger')) {
    /**
     * 获取日志服务实例或记录日志
     * 
     * @param string|null $message 日志消息
     * @param array $context 上下文信息
     * @param string $level 日志级别
     * @return LogService|void
     */
    function logger(string $message = null, array $context = [], string $level = 'info')
    {
        global $app;
        if (!isset($app)) {
            throw new \RuntimeException('Application instance not available.');
        }
        $logger = $app->getContainer()->get(LogService::class);

        if (is_null($message)) {
            return $logger;
        }

        return $logger->$level($message, $context);
    }
}

if (!function_exists('log_debug')) {
    /**
     * 记录调试日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    function log_debug(string $message, array $context = []): void
    {
        logger($message, $context, 'debug');
    }
}

if (!function_exists('log_info')) {
    /**
     * 记录信息日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    function log_info(string $message, array $context = []): void
    {
        logger($message, $context, 'info');
    }
}

if (!function_exists('log_warning')) {
    /**
     * 记录警告日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    function log_warning(string $message, array $context = []): void
    {
        logger($message, $context, 'warning');
    }
}

if (!function_exists('log_error')) {
    /**
     * 记录错误日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    function log_error(string $message, array $context = []): void
    {
        logger($message, $context, 'error');
    }
}

if (!function_exists('log_critical')) {
    /**
     * 记录严重错误日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文信息
     */
    function log_critical(string $message, array $context = []): void
    {
        logger($message, $context, 'critical');
    }
}

if (!function_exists('log_business')) {
    /**
     * 记录业务操作日志
     * 
     * @param string $module 模块名称
     * @param string $action 操作名称
     * @param array $data 相关数据
     * @param string $level 日志级别
     */
    function log_business(string $module, string $action, array $data = [], string $level = 'info'): void
    {
        logger()->logBusiness($module, $action, $data, $level);
    }
}
