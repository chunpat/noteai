<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\LogService;
use OneHour\SimaSDK\SimaApiConfig;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ApiConfigMiddleware implements MiddlewareInterface
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // SimaApiConfig::setConfig([
        //     'alias'=>'sima-api',
        //     'debug'=>env('SIMA_API_SETTING_DEBUG'),
        //     'base_uri'=>env('SIMA_API_SETTING_HOST'),
        //     'app_id'=>env('SIMA_API_SETTING_APP_ID'),
        //     'app_secret'=>env('SIMA_API_SETTING_APP_SECRET'),
        //     'log_handler'=>function($log){
        //         if(env('SIMA_API_SETTING_DEBUG')){
        //             $this->logService->logError(
        //                 (new \Exception($log)), 
        //                 ['error'=>'sima-api','error'=>$log]
        //             );
        //         }
        //     },
        // ]);
        $response = $handler->handle($request);
        return $response;
    }
    
} 