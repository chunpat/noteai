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

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    public function process(
        ServerRequestInterface $request, 
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $token = str_replace('Bearer ', '', $request->getHeaderLine('Authorization'));
        
        if (empty($token)) {
            throw new UnauthorizedException('请先登录', ErrorCode::UNAUTHORIZED);
        }

        $user = $this->auth->validateToken($token);
        if (!$user) {
            throw new UnauthorizedException('登录已过期，请重新登录', ErrorCode::UNAUTHORIZED);
        }

        // 将用户信息添加到请求属性中
        return $handler->handle($request->withAttribute('user', $user));
    }
}
