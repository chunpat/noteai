<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Constants\ErrorCode;
use App\Services\LogService;
use App\Exceptions\BusinessException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Exception\HttpNotFoundException;
use Slim\Psr7\Factory\ResponseFactory;
use Throwable;

class ErrorHandlerMiddleware implements MiddlewareInterface
{
    private LogService $logService;
    private ResponseFactory $responseFactory;
    private bool $displayErrorDetails;

    public function __construct(
        LogService $logService,
        ResponseFactory $responseFactory,
        bool $displayErrorDetails = false
    ) {
        $this->logService = $logService;
        $this->responseFactory = $responseFactory;
        $this->displayErrorDetails = $displayErrorDetails;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        try {
            return $handler->handle($request);
        } catch (Throwable $e) {
            // 获取请求上下文信息
            $context = [
                'uri' => (string) $request->getUri(),
                'method' => $request->getMethod(),
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
            ];

            // 处理业务异常（客户端错误）
            $statusCode = 400;
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();

            if ($e instanceof Throwable) {
                // 根据异常类型确定错误级别和响应
                $statusCode = 500;
                $errorCode = ErrorCode::SERVER_ERROR;
                $errorMessage = 'Internal Server Error';
                $this->logService->logError($e, $context);
            } 
            elseif ($e instanceof BusinessException) {
                // 客户端错误使用 info 级别记录
                $this->logService->getLogger()->info($errorMessage, array_merge([
                    'exception' => get_class($e),
                    'code' => $errorCode,
                ], $context));
            }
            // 处理404错误
            elseif ($e instanceof HttpNotFoundException) {
                $statusCode = 404;
                $errorCode = ErrorCode::NOT_FOUND;
                $errorMessage = '请求的资源不存在';
                // 404错误使用 info 级别记录
                $this->logService->getLogger()->info($errorMessage, $context);
            }
            // 处理其他服务器错误
            else {
                // 服务器错误使用 error 级别记录
                $this->logService->logError($e, $context);
            }

            // 创建错误响应
            $response = $this->responseFactory->createResponse($statusCode);
            
            // 构建错误响应内容
            $error = [
                'error_code' => $errorCode,
                'error_msg' => $errorMessage,
            ];
            
            // 在开发环境下显示详细错误信息
            if ($this->displayErrorDetails && $statusCode === 500) {
                $error['details'] = [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => explode("\n", $e->getTraceAsString()),
                ];
            }
            
            $response->getBody()->write(json_encode($error));
            
            return $response->withHeader('Content-Type', 'application/json');
        }
    }
}
