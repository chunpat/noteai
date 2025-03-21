<?php
declare(strict_types=1);

namespace App\Actions\Example;

use App\Actions\AbstractAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class HelloWorldAction extends AbstractAction
{
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $name = $request->getQueryParams()['name'] ?? 'World';
        
        return $this->respondWithData([
            'message' => "Hello, {$name}!",
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}
