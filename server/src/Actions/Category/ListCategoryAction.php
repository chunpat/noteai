<?php
declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class ListCategoryAction
{
    public function __invoke(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface 
    {
        $userId = $request->getAttribute('user_id');
        
        $categories = Category::where('user_id', $userId)
            ->orderBy('sort', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $response->withJson([
            'error_code' => 0,
            'error_msg' => '',
            'data' => $categories
        ]);
    }
}
