<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\LogService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ApiLoggerMiddleware implements MiddlewareInterface
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // 记录请求开始时间
        $startTime = microtime(true);
        
        // 获取请求数据
        $requestData = [
            'method' => $request->getMethod(),
            'uri' => (string) $request->getUri(),
            'headers' => $request->getHeaders(),
            'body' => $request->getParsedBody() ?? [],
            'query' => $request->getQueryParams(),
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $request->getHeaderLine('User-Agent'),
        ];
        
        // 处理请求
        $response = $handler->handle($request);
        
        // 计算执行时间
        $executionTime = microtime(true) - $startTime;
        
        // 获取响应数据
        $responseBody = (string) $response->getBody();
        $response->getBody()->rewind(); // 重置流指针
        
        $responseData = [
            'status' => $response->getStatusCode(),
            'headers' => $response->getHeaders(),
            'body' => $this->parseResponseBody($responseBody),
        ];
        
        // 记录日志
        $this->logService->logApiRequest($requestData, $responseData, $executionTime);
        
        return $response;
    }
    
    /**
     * 尝试解析响应体
     */
    private function parseResponseBody(string $body): array|string
    {
        if (empty($body)) {
            return '';
        }
        
        try {
            $decoded = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
            return $decoded;
        } catch (\JsonException $e) {
            // 如果不是JSON或太大，返回原始字符串
            return strlen($body) > 1000 ? substr($body, 0, 1000) . '...' : $body;
        }
    }
} 