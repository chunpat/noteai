<?php

namespace App\Actions\Auth;

use App\Actions\AbstractAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use App\Services\Auth;
use App\Exceptions\BusinessException;
use App\Constants\ErrorCode;

class VerifyCodeAction extends AbstractAction
{
    private $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    /**
     * @api {post} /auth/verify-code 验证码登录
     * @apiName VerifyCode
     * @apiGroup Auth
     * @apiVersion 1.0.0
     *
     * @apiParam {String} email 邮箱
     * @apiParam {String} code 验证码
     *
     * @apiSuccess {String} token 用户令牌
     * @apiSuccess {Object} user 用户信息
     * @apiSuccess {String} user.id 用户ID
     * @apiSuccess {String} user.email 邮箱
     * @apiSuccess {String} user.name 用户名
     * @apiSuccess {String} [user.avatar] 头像URL
     */
    protected function action(ServerRequestInterface $request): ResponseInterface 
    {
        $data = $request->getParsedBody();
        
        $email = $data['email'] ?? '';
        $code = $data['code'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new BusinessException(ErrorCode::AUTH_INVALID_EMAIL_FORMAT);
        }

        if (strlen($code) !== 6 || !is_numeric($code)) {
            throw new BusinessException(ErrorCode::AUTH_INVALID_CODE_FORMAT);
        }

        // 验证登录
        $result = $this->auth->verifyCode($email, $code);

        return $this->respondWithData([
            'token' => $result['token'],
            'user' => $result['user']
        ]);
    }
}
