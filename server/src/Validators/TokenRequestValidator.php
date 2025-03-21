<?php
declare(strict_types=1);

namespace App\Validators;

use App\Constants\ErrorCode;
use App\Exceptions\BusinessException;
use Respect\Validation\Validator;

class TokenRequestValidator
{
    /**
     * 验证令牌请求参数
     *
     * @param array $data 请求数据
     * @throws BusinessException
     */
    public static function validate(array $data): void
    {
        try {
            self::validateRequired($data);
            self::validateAppId($data['appid']);
            self::validateTimestamp($data['timestamp']);
            self::validateNonce($data['nonce']);
            self::validateSignature($data['signature']);
            self::validateOptionalData($data);
        } catch (\Throwable $e) {
            if ($e instanceof BusinessException) {
                throw $e;
            }
            throw new BusinessException(ErrorCode::BAD_REQUEST, $e->getMessage());
        }
    }

    private static function validateRequired(array $data): void
    {
        $required = ['appid', 'timestamp', 'nonce', 'signature'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "缺少必要参数: {$field}");
            }
        }
    }

    private static function validateAppId(string $appId): void
    {
        if (!Validator::create()->alnum()->length(16, 32)->validate($appId)) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'AppID格式不正确');
        }
    }

    private static function validateTimestamp(string $timestamp): void
    {
        if (!Validator::create()->numericVal()->positive()->validate($timestamp)) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, '时间戳格式不正确');
        }

        if (abs(time() - (int)$timestamp) > 300) {
            throw new BusinessException(ErrorCode::REQUEST_EXPIRED);
        }
    }

    private static function validateNonce(string $nonce): void
    {
        if (!Validator::create()->alnum()->length(8, 32)->validate($nonce)) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Nonce格式不正确');
        }
    }

    private static function validateSignature(string $signature): void
    {
        if (!Validator::create()->regex('/^[a-f0-9]{64}$/i')->validate($signature)) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, '签名格式不正确');
        }
    }

    private static function validateOptionalData(array $data): void
    {
        if (isset($data['data']) && !Validator::create()->arrayVal()->validate($data['data'])) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'data必须是有效的数组');
        }
    }
}
