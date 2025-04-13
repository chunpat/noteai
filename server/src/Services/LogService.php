<?php
declare(strict_types=1);

namespace App\Services;

use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

class LogService
{
    private LoggerInterface $logger;
    private LoggerInterface $apiLogger;
    private LoggerInterface $authLogger;
    private LoggerInterface $errorLogger;

    public function __construct(
        LoggerInterface $logger,
        LoggerInterface $apiLogger,
        LoggerInterface $authLogger,
        LoggerInterface $errorLogger
    ) {
        $this->logger = $logger;
        $this->apiLogger = $apiLogger;
        $this->authLogger = $authLogger;
        $this->errorLogger = $errorLogger;
    }

    /**
     * 记录调试级别日志
     */
    public function debug(string $message, array $context = []): void
    {
        $this->log(LogLevel::DEBUG, $message, $this->enrichContext($context));
    }

    /**
     * 记录信息级别日志
     */
    public function info(string $message, array $context = []): void
    {
        $this->log(LogLevel::INFO, $message, $this->enrichContext($context));
    }

    /**
     * 记录警告级别日志
     */
    public function warning(string $message, array $context = []): void
    {
        $this->log(LogLevel::WARNING, $message, $this->enrichContext($context));
    }

    /**
     * 记录错误级别日志
     */
    public function error(string $message, array $context = []): void
    {
        $this->log(LogLevel::ERROR, $message, $this->enrichContext($context));
    }

    /**
     * 记录关键级别日志
     */
    public function critical(string $message, array $context = []): void
    {
        $this->log(LogLevel::CRITICAL, $message, $this->enrichContext($context));
    }

    /**
     * 记录通用日志
     */
    private function log(string $level, string $message, array $context = []): void
    {
        $this->logger->log($level, $message, $context);
    }

    /**
     * 记录业务日志
     * 用于记录重要的业务操作日志，例如用户操作、数据变更等
     */
    public function logBusiness(string $module, string $action, array $data = [], string $level = LogLevel::INFO): void
    {
        $context = $this->enrichContext([
            'module' => $module,
            'action' => $action,
            'data' => $this->filterSensitiveData($data)
        ]);
        
        $message = sprintf('[%s] %s', $module, $action);
        $this->log($level, $message, $context);
    }

    /**
     * 增强上下文信息
     */
    private function enrichContext(array $context): array
    {
        // 添加基本信息
        $baseContext = [
            'timestamp' => date('Y-m-d H:i:s'),
            'request_id' => $_SERVER['HTTP_X_REQUEST_ID'] ?? uniqid('req_'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'url' => $_SERVER['REQUEST_URI'] ?? '',
            'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        ];

        // 如果有用户信息，也添加进去
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $baseContext['user'] = $_SERVER['PHP_AUTH_USER'];
        }

        return array_merge($baseContext, $context);
    }

    /**
     * 记录API请求日志
     */
    public function logApiRequest(array $requestData, array $responseData, float $executionTime): void
    {
        // 过滤敏感信息
        $filteredRequest = $this->filterSensitiveData($requestData);
        
        $this->apiLogger->info('API Request', [
            'request' => $filteredRequest,
            'response' => $responseData,
            'execution_time' => $executionTime,
        ]);
    }

    /**
     * 记录认证相关日志
     */
    public function logAuth(string $appId, string $action, bool $success, ?string $reason = null): void
    {
        $this->authLogger->info('Auth Event', [
            'app_id' => $appId,
            'action' => $action,
            'success' => $success,
            'reason' => $reason,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        ]);
    }

    /**
     * 记录错误日志
     */
    public function logError(\Throwable $exception, array $context = []): void
    {
        $this->errorLogger->error($exception->getMessage(), array_merge([
            'exception' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ], $context));
    }


    /**
     * 过滤敏感数据
     */
    private function filterSensitiveData(array $data): array
    {
        $sensitiveFields = ['password', 'appsecret', 'token', 'secret', 'key'];
        
        foreach ($data as $key => $value) {
            $keyStr = is_int($key) ? (string)$key : $key;
            if (in_array(strtolower($keyStr), $sensitiveFields)) {
                $data[$key] = '***FILTERED***';
            } elseif (is_array($value)) {
                $data[$key] = $this->filterSensitiveData($value);
            }
        }
        
        return $data;
    }

    /**
     * 获取应用日志记录器
     */
    public function getLogger(): LoggerInterface
    {
        return $this->logger;
    }

    /**
     * 获取API日志记录器
     */
    public function getApiLogger(): LoggerInterface
    {
        return $this->apiLogger;
    }

    /**
     * 获取认证日志记录器
     */
    public function getAuthLogger(): LoggerInterface
    {
        return $this->authLogger;
    }

    /**
     * 获取错误日志记录器
     */
    public function getErrorLogger(): LoggerInterface
    {
        return $this->errorLogger;
    }
}
