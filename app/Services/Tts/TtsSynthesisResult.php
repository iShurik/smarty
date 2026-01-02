<?php

namespace App\Services\Tts;

class TtsSynthesisResult
{
  public function __construct(
    public readonly string $content,
    public readonly string $mimeType,
    public readonly string $extension,
    public readonly array $meta = [],
  ) {
  }
}
