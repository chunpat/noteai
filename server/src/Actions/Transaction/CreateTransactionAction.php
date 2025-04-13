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

class CreateTransactionAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $user = $request->getAttribute('user');
        $data = $request->getParsedBody();

        // Validate required fields
        if (empty($data['category_id']) || !isset($data['amount']) || empty($data['date'])) {
            throw new BusinessException(ErrorCode::MISSING_REQUIRED_FIELDS, 'Category, amount and date are required');
        }

        // Validate category exists
        $category = Category::find($data['category_id']);
        if (!$category) {
            throw new BusinessException(ErrorCode::CATEGORY_NOT_FOUND, 'Category not found');
        }

        // Validate amount
        if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Amount must be a positive number');
        }

        // Create transaction
        $transaction = new Transaction();
        $transaction->fill([
            'user_id' => $user['id'],
            'category_id' => $data['category_id'],
            'amount' => $data['amount'],
            'note' => $data['note'] ?? null,
            'transaction_date' => $data['date']
        ]);
        $transaction->save();

        // Load category relation for response
        $transaction->load('category');

        return $this->respondWithData($transaction);
    }
}
