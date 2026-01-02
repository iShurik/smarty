<?php

return [
  'rate_limits' => [
    'donations' => [
      'per_minute' => 5,
      'per_hour' => 20,
    ],
  ],
  'profanity' => [
    'patterns' => [
      '/\b(?:fuck|shit|bitch)\b/iu',
      '/(?:хуй|пизд|ебан|бляд)/iu',
    ],
  ],
  'spam' => [
    'max_urls' => 1,
    'max_repeated_chars' => 6,
    'duplicate_window_sec' => 300,
  ],
];
