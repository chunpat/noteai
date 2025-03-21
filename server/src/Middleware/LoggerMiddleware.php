<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\Logger;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class LoggerMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $logger = Logger::getInstance();
        $startTime = microtime(true);
        
        // Generate request ID
        $requestId = uniqid('req_');
        $logger->pushProcessor(function ($record) use ($requestId) {
            $record['extra']['request_id'] = $requestId;
            return $record;
        });

        // Log request
        $logger->info('Request started', [
            'method' => $request->getMethod(),
            'path' => $request->getUri()->getPath(),
            'query' => $request->getUri()->getQuery(),
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? null,
            'user_agent' => $request->getHeaderLine('User-Agent'),
            'headers' => $this->sanitizeHeaders($request->getHeaders())
        ]);

        try {
            $response = $handler->handle($request);

            // Log response
            $duration = (microtime(true) - $startTime) * 1000;
            $logger->info('Request completed', [
                'status' => $response->getStatusCode(),
                'duration_ms' => round($duration, 2)
            ]);

            return $response;
        } catch (\Throwable $e) {
            // Log error
            $duration = (microtime(true) - $startTime) * 1000;
            $logger->error('Request failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'duration_ms' => round($duration, 2)
            ]);

            throw $e;
        }
    }

    private function sanitizeHeaders(array $headers): array
    {
        // Remove sensitive information from headers
        $sensitiveHeaders = ['Authorization', 'Cookie', 'X-Signature'];
        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['[REDACTED]'];
            }
        }
        return $headers;
    }
}
