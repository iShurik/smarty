<?php

namespace App\Services\Tts;

use App\Models\TtsVoice;

interface TtsProviderInterface
{
  public function synthesize(string $text, TtsVoice $voice): TtsSynthesisResult;
}
