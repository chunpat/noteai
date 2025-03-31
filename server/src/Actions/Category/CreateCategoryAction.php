<?php
declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class CreateCategoryAction
{
    public function __invoke(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface 
    {
        $data = $request->getParsedBody();
        $userId = $request->getAttribute('user_id');

        // 验证请求数据
        $required = ['name', 'type', 'icon'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return $response->withStatus(400)
                    ->withJson([
                        'error_code' => 400,
                        'error_msg' => "缺少必填字段: {$field}"
                    ]);
            }
        }

        // 验证类型
        if (!in_array($data['type'], ['income', 'expense'])) {
            return $response->withStatus(400)
                ->withJson([
                    'error_code' => 400,
                    'error_msg' => '类型必须是 income 或 expense'
                ]);
        }

        // 创建分类
        $category = new Category();
        $category->user_id = $userId;
        $category->name = $data['name'];
        $category->type = $data['type'];
        $category->icon = $data['icon'];
        $category->sort = $data['sort'] ?? 0;
        $category->save();

        return $response->withJson([
            'error_code' => 0,
            'error_msg' => '',
            'data' => $category
        ]);
    }
}
