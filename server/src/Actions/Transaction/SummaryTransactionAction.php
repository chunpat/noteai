<?php
declare(strict_types=1);

namespace App\Actions\Transaction;

use App\Actions\AbstractAction;
use App\Models\Transaction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class SummaryTransactionAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $userId = $request->getAttribute('user')['id'];

        // 计算总收入 用Transaction 的user_id
        $totalIncome = (float) Transaction::where('transactions.user_id', $userId) // 明确指定表名
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('categories.type', 'income') // 只计算收入类型的交易
            ->sum('transactions.amount'); // 明确指定表名

        // 计算总支出
        $totalExpense = (float) Transaction::where('transactions.user_id', $userId) // 明确指定表名
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('categories.type', 'expense') // 只计算支出类型的交易
            ->sum('transactions.amount'); // 明确指定表名

        // 返回汇总数据
        $summary = [
            'total_income' => $totalIncome,
            'total_expense' => abs($totalExpense), // 转为正数
        ];

        return $this->respondWithData($summary);
    }
}
