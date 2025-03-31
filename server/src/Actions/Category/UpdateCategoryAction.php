<?php
declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class UpdateCategoryAction
{
    public function __invoke(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface 
    {
        $data = $request->getParsedBody();
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

        // 验证类型
        if (isset($data['type']) && !in_array($data['type'], ['income', 'expense'])) {
            return $response->withStatus(400)
                ->withJson([
                    'error_code' => 400,
                    'error_msg' => '类型必须是 income 或 expense'
                ]);
        }

        // 更新分类信息
        if (isset($data['name'])) {
            $category->name = $data['name'];
        }
        if (isset($data['type'])) {
            $category->type = $data['type'];
        }
        if (isset($data['icon'])) {
            $category->icon = $data['icon'];
        }
        if (isset($data['sort'])) {
            $category->sort = $data['sort'];
        }
        
        $category->save();

        return $response->withJson([
            'error_code' => 0,
            'error_msg' => '',
            'data' => $category
        ]);
    }
}
