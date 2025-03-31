<?php
declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use App\Models\Transaction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class DeleteCategoryAction
{
    public function __invoke(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface 
    {
        $userId = $request->getAttribute('user_id');
        $categoryId = $args['id'];

        // 检查分类是否存在且属于当前用户
        $category = Category::where('id', $categoryId)
            ->where('user_id', $userId)
            ->first();

        if (!$category) {
            return $response->withStatus(404)
                ->withJson([
                    'error_code' => 404,
                    'error_msg' => '分类不存在'
                ]);
        }

        // 检查是否有关联的交易记录
        $transactionCount = Transaction::where('category_id', $categoryId)->count();
        if ($transactionCount > 0) {
            return $response->withStatus(400)
                ->withJson([
                    'error_code' => 400,
                    'error_msg' => '该分类下存在交易记录，无法删除'
                ]);
        }

        // 删除分类
        $category->delete();

        return $response->withJson([
            'error_code' => 0,
            'error_msg' => '',
            'data' => null
        ]);
    }
}
