<?php
declare(strict_types=1);

use App\Actions\Auth\LogoutAction;
use App\Actions\Auth\SendCodeAction;
use App\Actions\Auth\VerifyCodeAction;
use App\Actions\Category\CreateCategoryAction;
use App\Actions\Category\DeleteCategoryAction;
use App\Actions\Category\ListCategoryAction;
use App\Actions\Category\UpdateCategoryAction;
use App\Actions\Example\HelloWorldAction;
use App\Actions\Transaction\CreateTransactionAction;
use App\Actions\Transaction\DeleteTransactionAction;
use App\Actions\Transaction\ListTransactionAction;
use App\Actions\Transaction\SummaryTransactionAction;
use App\Actions\Transaction\UpdateTransactionAction;
use App\Actions\User\ProfileAction;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

return function (App $app) {
    // Health check endpoint
    $app->get('/health', function ($request, $response) {
        $response->getBody()->write(json_encode(['status' => 'healthy']));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Public API group
    $app->group('/api/v1', function (Group $group) {
        // Auth routes
        $group->post('/auth/send-code', SendCodeAction::class);
        $group->post('/auth/verify-code', VerifyCodeAction::class);
        
        // Example route
        $group->get('/hello', HelloWorldAction::class);
    });

    // Protected API group (requires authentication)
    $app->group('/api/v1', function (Group $group) {
        // Auth routes
        $group->post('/auth/logout', LogoutAction::class);

        // User routes
        $group->get('/user/profile', ProfileAction::class);

        // Category routes
        $group->get('/categories', ListCategoryAction::class);
        $group->post('/categories', CreateCategoryAction::class);
        $group->post('/categories/update/{id}', UpdateCategoryAction::class);
        $group->post('/categories/delete/{id}', DeleteCategoryAction::class);

        // Transaction routes
        $group->get('/transactions', ListTransactionAction::class);
        $group->get('/transactions/summary', SummaryTransactionAction::class);
        $group->post('/transactions', CreateTransactionAction::class);
        $group->post('/transactions/update/{id}', UpdateTransactionAction::class);
        $group->post('/transactions/delete/{id}', DeleteTransactionAction::class);
    });
};
