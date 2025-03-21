<?php
declare(strict_types=1);

namespace App\Constants;

class ErrorCode
{
    // 成功
    public const SUCCESS = 0;

    // 系统级错误 (1000-1999)
    public const SERVER_ERROR = 1000;
    public const BAD_REQUEST = 1001;
    public const UNAUTHORIZED = 1002;
    public const FORBIDDEN = 1003;
    public const NOT_FOUND = 1004;

    // 认证相关错误 (2000-2999)
    public const AUTH_VERIFICATION_CODE_NOT_FOUND = 2000;
    public const AUTH_VERIFICATION_CODE_EXPIRED = 2001;
    public const AUTH_VERIFICATION_CODE_INVALID = 2002;
    public const AUTH_TOKEN_INVALID = 2003;
    public const AUTH_INVALID_EMAIL_FORMAT = 2004;
    public const AUTH_INVALID_CODE_FORMAT = 2005;

    // 用户相关错误 (3000-3999)
    public const USER_NOT_FOUND = 3000;
    public const USER_ALREADY_EXISTS = 3001;

    private static array $messages = [
        self::SUCCESS => 'Success',
        
        self::SERVER_ERROR => '服务器内部错误',
        self::BAD_REQUEST => '请求参数错误',
        self::UNAUTHORIZED => '未授权或登录已过期',
        self::FORBIDDEN => '无权访问',
        self::NOT_FOUND => '资源不存在',

        self::AUTH_VERIFICATION_CODE_NOT_FOUND => '验证码不存在',
        self::AUTH_VERIFICATION_CODE_EXPIRED => '验证码已过期',
        self::AUTH_VERIFICATION_CODE_INVALID => '验证码错误',
        self::AUTH_TOKEN_INVALID => '无效的认证令牌',
        self::AUTH_INVALID_EMAIL_FORMAT => '邮箱格式不正确',
        self::AUTH_INVALID_CODE_FORMAT => '验证码格式不正确',

        self::USER_NOT_FOUND => '用户不存在',
        self::USER_ALREADY_EXISTS => '用户已存在',
    ];

    public static function getMessage(int $code): string
    {
        return self::$messages[$code] ?? '未知错误';
    }
}
