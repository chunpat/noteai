<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\Logger;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Routing\RouteContext;

class CorsMiddleware implements MiddlewareInterface
{
    private array $allowedOrigins = ['*'];
    private array $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    private array $allowedHeaders = ['Content-Type', 'Authorization', 'X-App-ID', 'X-Timestamp', 'X-Nonce', 'X-Signature', 'Accept', 'Accept-Language', 'Accept-Encoding', 'Cache-Control', 'Pragma', 'Origin', 'Referer', 'User-Agent'];
    private int $maxAge = 3600;

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Set CORS headers early for any early exits (var_dump/die)
        if (!headers_sent()) {
            $origin = $request->getHeaderLine('Origin');
            if (in_array('*', $this->allowedOrigins)) {
                header('Access-Control-Allow-Origin: *');
            } elseif (in_array($origin, $this->allowedOrigins)) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: ' . implode(', ', $this->allowedMethods));
            header('Access-Control-Allow-Headers: ' . implode(', ', $this->allowedHeaders));
            header('Access-Control-Max-Age: ' . $this->maxAge);
        }

        // Also ensure headers will be set on shutdown
        $allowedOrigins = $this->allowedOrigins;
        $allowedMethods = $this->allowedMethods;
        $allowedHeaders = $this->allowedHeaders;
        $maxAge = $this->maxAge;

        register_shutdown_function(function () use ($request, $allowedOrigins, $allowedMethods, $allowedHeaders, $maxAge) {
            if (!headers_sent()) {
                $origin = $request->getHeaderLine('Origin');
                if (in_array('*', $allowedOrigins)) {
                    header('Access-Control-Allow-Origin: *');
                } elseif (in_array($origin, $allowedOrigins)) {
                    header('Access-Control-Allow-Origin: ' . $origin);
                }
                header('Access-Control-Allow-Credentials: true');
                header('Access-Control-Allow-Methods: ' . implode(', ', $allowedMethods));
                header('Access-Control-Allow-Headers: ' . implode(', ', $allowedHeaders));
                header('Access-Control-Max-Age: ' . $maxAge);
            }
        });

        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response = new \Slim\Psr7\Response();
            return $this->withCorsHeaders($response, $request)->withStatus(204);
        }

        // Handle actual requests
        $response = $handler->handle($request);
        return $this->withCorsHeaders($response, $request);
    }

    private function withCorsHeaders(ResponseInterface $response, ServerRequestInterface $request): ResponseInterface
    {
        logger('CORS Middleware');

        // Set content type for var_dump output
        if (stripos(php_sapi_name(), 'cgi') !== false) {
            header('Status: 200 OK');
        }
        header('Content-Type: text/plain;charset=utf-8');
        
        $origin = $request->getHeaderLine('Origin');
        
        // Always set all CORS headers for both preflight and actual requests
        $response = $response
            ->withHeader('Content-Type', 'text/plain;charset=utf-8')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods))
            ->withHeader('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders))
            ->withHeader('Access-Control-Max-Age', (string) $this->maxAge);

        // Set Access-Control-Allow-Origin after other headers
        if (in_array('*', $this->allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', '*');
        } elseif (in_array($origin, $this->allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }

        return $response;
    }
}
