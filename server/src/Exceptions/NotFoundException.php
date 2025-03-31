<?php
declare(strict_types=1);

namespace App\Exceptions;

use App\Constants\ErrorCode;

class NotFoundException extends AbstractException
{
    private int $errorCode;

    public function __construct(int $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: ErrorCode::getMessage($errorCode));
    }

    public function getErrorCode(): int
    {
        return $this->errorCode;
    }
}
