<?php
require 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// API Base URL
$baseUrl = 'http://localhost:8080';

// Test AppID and AppSecret
$appId = 'your_app_id';
$appSecret = 'your_app_secret';

// Function to generate signature
function generateSignature(array $params, string $appSecret): string {
    ksort($params);
    $stringToSign = '';
    foreach ($params as $key => $value) {
        $stringToSign .= $key . '=' . (is_array($value) ? json_encode($value) : $value) . '&';
    }
    $stringToSign = rtrim($stringToSign, '&');
    return hash_hmac('sha256', $stringToSign, $appSecret);
}

// 1. Get access token
$params = [
    'appid' => $appId,
    'timestamp' => time(),
    'nonce' => substr(str_shuffle(str_repeat('0123456789abcdefghijklmnopqrstuvwxyz', 10)), 0, 8)
];
$signature = generateSignature($params, $appSecret);

$ch = curl_init($baseUrl . '/api/v1/auth/token');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($params + ['signature' => $signature])
]);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "=== Get Access Token ===\n";
echo "Status Code: $statusCode\n";
echo "Response: $response\n\n";

if ($statusCode !== 200) {
    die("Failed to get access token\n");
}

$tokenData = json_decode($response, true);
$accessToken = $tokenData['data']['token'];

// 2. Create Enterprise
$ch = curl_init($baseUrl . '/api/v1/enterprises');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $accessToken
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'name' => 'Test Enterprise ' . time(),
        'config' => [
            'auto_approval' => true,
            'allowed_ips' => ['192.168.1.1']
        ]
    ])
]);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "=== Create Enterprise ===\n";
echo "Status Code: $statusCode\n";
echo "Response: $response\n\n";

// 3. List Enterprises
$ch = curl_init($baseUrl . '/api/v1/enterprises?page=1&per_page=10&order=created_at&order_type=desc');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $accessToken
    ]
]);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "=== List Enterprises ===\n";
echo "Status Code: $statusCode\n";
echo "Response: $response\n";
