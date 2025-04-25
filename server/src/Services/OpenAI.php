<?php
declare(strict_types=1);

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use App\Constants\ErrorCode;
use App\Exceptions\BusinessException;

class OpenAI
{
    private Client $client;
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = $_ENV['OPENAI_API_KEY'];
        $this->model = $_ENV['OPENAI_MODEL'];
        $this->client = new Client([
            'base_uri' => 'https://ark.cn-beijing.volces.com/api/v3/',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Send chat completion request to OpenAI
     *
     * @param array $messages Array of message objects with role and content
     * @return array Response from OpenAI
     * @throws BusinessException
     */
    public function chatCompletion(array $messages): array
    {
        try {
            $response = $this->client->post('chat/completions', [
                'json' => [
                    'model' => $this->model,
                    'messages' => $messages,
                    'temperature' => 0.7,
                ],
            ]);

            $result = json_decode((string)$response->getBody(), true);

            if (!isset($result['choices'][0]['message'])) {
                throw new BusinessException(ErrorCode::SERVER_ERROR, 'Invalid response from OpenAI');
            }

            return $result['choices'][0]['message'];
        } catch (\Exception $e) {
            throw new BusinessException(ErrorCode::SERVER_ERROR, 'Failed to communicate with OpenAI: ' . $e->getMessage());
        }
    }

    /**
     * Helper method to analyze transaction text and extract structured data
     *
     * @param string $text User input text
     * @return array Structured transaction data
     */
    public function analyzeTransaction(string $text): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => '你是一个智能记账助手。请分析用户的收支记录并提取关键信息：
1. amount: 支出或收入金额（数字）
2. category: 分类（例如：餐饮、交通、工资等）
3. description: 具体描述
4. type: 类型（"支出"或"收入"）

请用JSON格式返回，示例：
{"amount": 50, "category": "餐饮", "description": "午餐", "type": "支出"}'
            ],
            [
                'role' => 'user',
                'content' => $text
            ]
        ];

        $response = $this->chatCompletion($messages);
        $data = json_decode($response['content'], true);
        
        if (!$data || !isset($data['amount']) || !isset($data['category']) || !isset($data['type'])) {
            throw new BusinessException(ErrorCode::SERVER_ERROR, 'Failed to parse transaction details');
        }

        // Add current timestamp if not provided
        if (!isset($data['date'])) {
            $data['date'] = date('Y-m-d H:i:s');
        }

        return $data;
    }
}
