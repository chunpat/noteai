<?php

namespace App\Actions\User;

use App\Actions\AbstractAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use App\Services\Auth;

class ProfileAction extends AbstractAction
{
    private $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    /**
     * @api {get} /user/profile 获取用户资料
     * @apiName GetProfile
     * @apiGroup User
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Bearer token
     *
     * @apiSuccess {String} id 用户ID
     * @apiSuccess {String} email 邮箱
     * @apiSuccess {String} name 用户名
     * @apiSuccess {String} [avatar] 头像URL
     */
    protected function action(ServerRequestInterface $request): ResponseInterface 
    {
        // 从中间件获取已验证的用户信息
        $user = $request->getAttribute('user');
        
        return $this->respondWithData($user);
    }
}
