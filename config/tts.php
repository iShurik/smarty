<?php

return [
  'provider' => env('TTS_PROVIDER', 'mock'),
  'disk' => env('TTS_DISK', env('FILESYSTEM_DISK', 'local')),
  'path_prefix' => env('TTS_PATH_PREFIX', 'tts'),
  'queue' => env('TTS_QUEUE', 'tts'),
];
