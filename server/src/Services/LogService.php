<?php
declare(strict_types=1);

namespace App\Services;

use Psr\Log\LoggerInterface;

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
