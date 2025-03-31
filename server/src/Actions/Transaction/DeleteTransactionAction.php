<?php
declare(strict_types=1);

namespace App\Actions\Transaction;

use App\Actions\AbstractAction;
use App\Constants\ErrorCode;
use App\Models\Transaction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use App\Exceptions\BusinessException;

class DeleteTransactionAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $userId = $this->getAuthUserId($request);

        // Find and verify ownership
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $userId)
            ->first();
            
        if (!$transaction) {
            throw new BusinessException(ErrorCode::TRANSACTION_NOT_FOUND, 'Transaction not found');
        }

        $transaction->delete();

        return $this->respondWithData(['success' => true]);
    }
}
