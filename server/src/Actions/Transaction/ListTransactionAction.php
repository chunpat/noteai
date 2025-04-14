<?php
declare(strict_types=1);

namespace App\Actions\Transaction;

use App\Actions\AbstractAction;
use App\Models\Transaction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class ListTransactionAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $params = $request->getQueryParams();
        $userId = $request->getAttribute('user')['id'];
        
        $query = Transaction::query()
            ->with('category') // Eager load category
            ->where('user_id', $userId);

        // Filter by category_id
        if (!empty($params['category_id'])) {
            $query->where('category_id', (int) $params['category_id']);
        }

        // Filter by category type (through join)
        if (!empty($params['type'])) {
            $query->whereHas('category', function ($q) use ($params) {
                $q->where('type', $params['type']);
            });
        }

        // Filter by date range
        if (!empty($params['start_date'])) {
            $query->where('transaction_date', '>=', $params['start_date']);
        }
        if (!empty($params['end_date'])) {
            $query->where('transaction_date', '<=', $params['end_date']);
        }

        // Pagination
        $page = !empty($params['page']) ? (int) $params['page'] : 1;
        $perPage = !empty($params['per_page']) ? (int) $params['per_page'] : 20;

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
        return $this->respondWithData($transactions);
    }
}
