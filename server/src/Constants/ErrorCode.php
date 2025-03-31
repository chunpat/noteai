<?php
declare(strict_types=1);

namespace App\Constants;

class ErrorCode
{
    public const SUCCESS = 0;
    public const BAD_REQUEST = 400;
    public const UNAUTHORIZED = 0;
    public const FORBIDDEN = 403;
    public const NOT_FOUND = 404;
    public const SERVER_ERROR = 500;

    // Business error codes
    public const CATEGORY_EXISTS = 2001;
    public const INVALID_CATEGORY_TYPE = 2002;
    public const MISSING_REQUIRED_FIELDS = 2003;
    public const TRANSACTION_NOT_FOUND = 2004;
    public const CATEGORY_NOT_FOUND = 2005;

    public static function getMessage(int $errorCode): string
    {
        $messages = [
            self::SUCCESS => 'Success',
            self::BAD_REQUEST => 'Bad Request',
            self::UNAUTHORIZED => 'aaa',
            self::FORBIDDEN => 'Forbidden',
            self::NOT_FOUND => 'Not Found',
            self::SERVER_ERROR => 'Server Error',
            self::CATEGORY_EXISTS => 'Category already exists',
            self::INVALID_CATEGORY_TYPE => 'Invalid category type',
            self::MISSING_REQUIRED_FIELDS => 'Missing required fields',
            self::TRANSACTION_NOT_FOUND => 'Transaction not found',
            self::CATEGORY_NOT_FOUND => 'Category not found',
        ];

        return $messages[$errorCode] ?? 'Unknown error';
    }
}
