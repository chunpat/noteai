<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\Auth;
use App\Constants\ErrorCode;
use App\Exceptions\UnauthorizedException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AuthenticationMiddleware implements MiddlewareInterface
{
    private Auth $auth;
    
    /**
     * 无需认证的路由白名单
     */
    private array $whiteList = [
        '/api/v1/auth/send-code',
        '/api/v1/auth/verify-code',
        '/api/v1/auth/logout',
        '/health',
        '/api/v1/hello'
    ];

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    public function process(
        ServerRequestInterface $request, 
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $path = $request->getUri()->getPath();
        
        // 检查是否在白名单中
        if (in_array($path, $this->whiteList)) {
            return $handler->handle($request);
        }

        $token = str_replace('Bearer ', '', $request->getHeaderLine('Authorization'));
        
        if (empty($token)) {
            throw new UnauthorizedException(ErrorCode::UNAUTHORIZED);
        }

        $user = $this->auth->validateToken($token);
        if (!$user) {
            throw new UnauthorizedException(ErrorCode::UNAUTHORIZED);
        }

        // 将用户信息添加到请求属性中
        return $handler->handle($request->withAttribute('user', $user));
    }
}
