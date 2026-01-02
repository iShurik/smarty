<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DonationAntiFraudService
{
  public function validateDonationContent(
    Request $request,
    int $streamerId,
    ?string $messageText,
    ?string $donorName
  ): array {
    $messageText = $this->normalizeText($messageText);
    $donorName = $this->normalizeText($donorName);

    $profanityField = $this->detectProfanityField($messageText, $donorName);
    if ($profanityField !== null) {
      return [
        'allowed' => false,
        'field' => $profanityField,
        'reject_reason' => 'profanity',
      ];
    }

    if ($messageText !== '') {
      $spamReason = $this->detectSpam($messageText);
      if ($spamReason !== null) {
        return [
          'allowed' => false,
          'field' => 'message_text',
          'reject_reason' => $spamReason,
        ];
      }

      if (! $this->registerMessageFingerprint($request, $streamerId, $messageText, $donorName)) {
        return [
          'allowed' => false,
          'field' => 'message_text',
          'reject_reason' => 'duplicate_message',
        ];
      }
    }

    return [
      'allowed' => true,
      'field' => null,
      'reject_reason' => null,
    ];
  }

  private function detectProfanityField(string $messageText, string $donorName): ?string
  {
    $patterns = config('anti_fraud.profanity.patterns', []);

    if ($this->containsProfanity($donorName, $patterns)) {
      return 'donor_name';
    }

    if ($this->containsProfanity($messageText, $patterns)) {
      return 'message_text';
    }

    return null;
  }

  private function containsProfanity(string $text, array $patterns): bool
  {
    if ($text === '') {
      return false;
    }

    foreach ($patterns as $pattern) {
      if (@preg_match($pattern, $text) === 1) {
        return true;
      }
    }

    return false;
  }

  private function detectSpam(string $messageText): ?string
  {
    $maxUrls = (int) config('anti_fraud.spam.max_urls', 1);
    $urlCount = preg_match_all('~https?://\S+|www\.\S+~iu', $messageText);

    if ($urlCount !== false && $urlCount > $maxUrls) {
      return 'spam_links';
    }

    $repeatLimit = (int) config('anti_fraud.spam.max_repeated_chars', 6);
    if (preg_match('/([\p{L}\p{N}])\1{' . $repeatLimit . ',}/u', $messageText)) {
      return 'spam_chars';
    }

    return null;
  }

  private function registerMessageFingerprint(
    Request $request,
    int $streamerId,
    string $messageText,
    string $donorName
  ): bool {
    $ttl = (int) config('anti_fraud.spam.duplicate_window_sec', 300);
    $ip = $request->ip() ?? 'unknown';
    $fingerprint = sha1($ip . '|' . $streamerId . '|' . $messageText . '|' . $donorName);
    $cacheKey = "donations:dup:{$fingerprint}";

    return Cache::add($cacheKey, now()->timestamp, $ttl);
  }

  private function normalizeText(?string $text): string
  {
    if ($text === null) {
      return '';
    }

    $text = trim($text);
    if ($text === '') {
      return '';
    }

    $text = mb_strtolower($text, 'UTF-8');
    return preg_replace('/\s+/u', ' ', $text) ?? $text;
  }
}
