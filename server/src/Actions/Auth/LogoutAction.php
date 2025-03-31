<?php

namespace App\Actions\Auth;

use App\Actions\AbstractAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use App\Services\Auth;

class LogoutAction extends AbstractAction
{
    private $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    /**
     * @api {post} /auth/logout 退出登录
     * @apiName Logout
     * @apiGroup Auth
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Bearer token
     *
     * @apiSuccess {Boolean} success 是否成功
     */
    protected function action(ServerRequestInterface $request): ResponseInterface 
    {
        // 获取当前用户的token
        $token = str_replace('Bearer ', '', $request->getHeaderLine('Authorization'));
        
        var_dump($token);exit;
        // 执行退出登录
        $this->auth->logout($token);

        return $this->respondWithData([
            'success' => true
        ]);
    }
}
