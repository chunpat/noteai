<?php
declare(strict_types=1);

namespace App\Actions\Transaction;

use App\Actions\AbstractAction;
use App\Constants\ErrorCode;
use App\Models\Category;
use App\Models\Transaction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use App\Exceptions\BusinessException;

class UpdateTransactionAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $id = (int) $request->getAttribute('id');
        $userId = $this->getAuthUserId($request);
        $data = $request->getParsedBody();

        // Find and verify ownership
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $userId)
            ->first();
            
        if (!$transaction) {
            throw new BusinessException(ErrorCode::TRANSACTION_NOT_FOUND, 'Transaction not found');
        }

        // If category is being updated, validate it exists
        if (!empty($data['category_id'])) {
            $category = Category::find($data['category_id']);
            if (!$category) {
                throw new BusinessException(ErrorCode::CATEGORY_NOT_FOUND, 'Category not found');
            }
        }

        // Validate amount if provided
        if (isset($data['amount'])) {
            if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, 'Amount must be a positive number');
            }
        }

        // Update transaction
        $transaction->fill(array_filter([
            'category_id' => $data['category_id'] ?? null,
            'amount' => $data['amount'] ?? null,
            'note' => $data['note'] ?? null,
            'transaction_date' => $data['transaction_date'] ?? null
        ]));
        $transaction->save();

        // Load category relation for response
        $transaction->load('category');

        return $this->respondWithData($transaction);
    }
}
