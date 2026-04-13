<?php
/**
 * ОКЛ · AI Consultant Proxy
 * Підтримує: Anthropic Claude та OpenAI ChatGPT
 *
 * Налаштування (environment variables):
 *   ANTHROPIC_API_KEY  — ключ з console.anthropic.com  (пріоритет)
 *   OPENAI_API_KEY     — ключ з platform.openai.com     (fallback)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw  = file_get_contents('php://input');
$body = json_decode($raw ?: '{}', true);

$messages = $body['messages'] ?? null;
$system   = is_string($body['system'] ?? null) ? $body['system'] : '';

if (!is_array($messages) || count($messages) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'messages must be a non-empty array']);
    exit;
}

// ── Anthropic Claude ─────────────────────────────────────────────
$anthropicKey = getenv('ANTHROPIC_API_KEY') ?: ($_SERVER['ANTHROPIC_API_KEY'] ?? '');
if ($anthropicKey !== '') {
    $payload = json_encode([
        'model'      => 'claude-3-5-haiku-latest',
        'max_tokens' => 700,
        'system'     => $system,
        'messages'   => $messages,
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-api-key: ' . $anthropicKey,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT    => 30,
    ]);
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
        $data  = json_decode($response, true);
        $reply = $data['content'][0]['text'] ?? '';
        if ($reply !== '') {
            echo json_encode(['reply' => $reply], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// ── OpenAI ChatGPT ───────────────────────────────────────────────
$openaiKey = getenv('OPENAI_API_KEY') ?: ($_SERVER['OPENAI_API_KEY'] ?? '');
if ($openaiKey !== '') {
    $oMessages = array_merge(
        $system !== '' ? [['role' => 'system', 'content' => $system]] : [],
        $messages
    );
    $payload = json_encode([
        'model'      => 'gpt-4o-mini',
        'max_tokens' => 700,
        'messages'   => $oMessages,
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openaiKey,
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT    => 30,
    ]);
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
        $data  = json_decode($response, true);
        $reply = $data['choices'][0]['message']['content'] ?? '';
        if ($reply !== '') {
            echo json_encode(['reply' => $reply], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

http_response_code(500);
echo json_encode(['error' => 'No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY on the server.']);
