<?php

namespace App\Actions\Auth;

use App\Actions\AbstractAction;
use App\Constants\ErrorCode;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use App\Services\Auth;
use App\Exceptions\BusinessException;

class SendCodeAction extends AbstractAction
{
    protected $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $data = $request->getParsedBody();

        $email = $data['email'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new BusinessException(ErrorCode::EMAIL_FORMAT_ERROR);
        }

        // 发送验证码
        $this->auth->sendVerificationCode($email);

        return $this->respondWithData([
            'success' => true,
            'message' => '验证码已发送，请查收邮件'
        ]);
    }
}
