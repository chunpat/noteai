<?php
declare(strict_types=1);

namespace App\Actions\Category;

use App\Actions\AbstractAction;
use App\Models\Category;
use App\Services\Auth;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class ListCategoryAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        // 添加连接检查
        if (!Category::resolveConnection()) {
            throw new \RuntimeException('Database connection not configured');
        }
        $user = $request->getAttribute('user');
        $categories = Category::whereIn('user_id', [$user['id'],0])
            ->orderBy('sort', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return $this->respondWithData([
            'data' => $categories
        ]);
    }
}
