<?php
declare(strict_types=1);

namespace App\Actions\Transaction;

use App\Actions\AbstractAction;
use App\Services\OpenAI;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class AnalyzeTransactionAction extends AbstractAction
{
    private OpenAI $openai;

    public function __construct(OpenAI $openai)
    {
        $this->openai = $openai;
    }

    /**
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    protected function action(ServerRequestInterface $request): ResponseInterface
    {
        $data = $request->getParsedBody();
        $text = $data['text'] ?? '';

        if (empty($text)) {
            return $this->respondWithData([
                'error' => 'Text input is required'
            ], 400);
        }

        $result = $this->openai->analyzeTransaction($text);
        $result['date'] = date('Y-m-d H:i:s'); 

        return $this->respondWithData([
            'transaction' => $result
        ]);
    }
}
