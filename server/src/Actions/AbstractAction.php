<?php
declare(strict_types=1);

namespace App\Actions;

use App\Constants\ErrorCode;
use App\Services\Auth;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

abstract class AbstractAction implements RequestHandlerInterface
{
    protected $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        try {
            return $this->action($request);
        } catch (\Exception $e) {
            return $this->respondWithError($e->getMessage(), $this->getStatusCodeForException($e));
        }
    }

    abstract protected function action(ServerRequestInterface $request): ResponseInterface;

    protected function respondWithData($data = null, int $statusCode = 200): ResponseInterface
    {
        $payload = [
            'error_code' => ErrorCode::SUCCESS,
            'error_msg' => ErrorCode::getMessage(ErrorCode::SUCCESS),
            'data' => $data ?? new \stdClass()
        ];

        $response = new Response();
        $responseBody = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $response->getBody()->write($responseBody);

        // 确保只设置一次 Content-Type
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    protected function respondWithError(string $message, int $errorCode = ErrorCode::SERVER_ERROR): ResponseInterface
    {
        $response = new Response();
        $payload = [
            'error_code' => $errorCode,
            'error_msg' => $errorCode >= 1000 ? ErrorCode::getMessage($errorCode) : $message,
            'data' => new \stdClass()
        ];

        $responseBody = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR); // 确保 JSON 编码正确
        $response->getBody()->write($responseBody);

        // 业务错误返回200，系统错误返回对应状态码
        $statusCode = 200;
        if ($errorCode < 1000) {
            $statusCode = $errorCode;
        }

        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8') // 明确指定 charset
            ->withStatus($statusCode);
    }

    protected function getStatusCodeForException(\Exception $e): int 
    {
        if ($e instanceof \App\Exceptions\BusinessException) {
            return $e->getErrorCode();
        }
        
        // 系统级错误
        switch(true) {
            case $e instanceof \InvalidArgumentException:
                return 400;
            case $e instanceof \App\Exceptions\UnauthorizedException:
                return 401;
            case $e instanceof \App\Exceptions\ForbiddenException:
                return 403;
            case $e instanceof \App\Exceptions\NotFoundException:
                return 404;
            default:
                return 500;
        }
    }
}
