<?php
declare(strict_types=1);

use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

return function (App $app) {
    // Health check endpoint
    $app->get('/health', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode(['status' => 'healthy']));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // API routes group
    $app->group('/api/v1', function ($group) {
        // Auth routes (public)
        $group->post('/auth/send-code', \App\Actions\Auth\SendCodeAction::class);
        $group->post('/auth/verify-code', \App\Actions\Auth\VerifyCodeAction::class);
        
        // Protected routes (require authentication)
        $group->group('', function ($group) {
            // Auth
            $group->post('/auth/logout', \App\Actions\Auth\LogoutAction::class);
            
            // User
            $group->get('/user/profile', \App\Actions\User\ProfileAction::class);
        })->add(\App\Middleware\AuthenticationMiddleware::class);
    });
};
