<?php
declare(strict_types=1);

namespace App\Actions\Category;

use App\Actions\AbstractAction;
use App\Constants\ErrorCode;
use App\Exceptions\BusinessException;
use App\Models\Category;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class CreateCategoryAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user');
        $userId = $user['id'];

        // 验证请求数据
        $required = ['name', 'type', 'icon'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new BusinessException(ErrorCode::CATEGORY_NOT_FOUND, "缺少必填字段: {$field}");
            }
        }

        // 验证类型
        if (!in_array($data['type'], ['income', 'expense'])) {
            throw new BusinessException(ErrorCode::CATEGORY_NOT_FOUND, '类型必须是 income 或 expense');
        }

        //查看是否已经存在
        $category = Category::where('user_id', [$userId,0])
            ->where('name', $data['name'])
            ->where('type', $data['type'])
            ->first();
        if ($category) {
            return $this->respondWithData($category);
        }
        // 创建分类
        $category = new Category();
        $category->user_id = $userId;
        $category->name = $data['name'];
        $category->type = $data['type'];
        $category->icon = $data['icon'];
        $category->sort = $data['sort'] ?? 0;
        $category->save();
 
        return $this->respondWithData($category);
    }
}
