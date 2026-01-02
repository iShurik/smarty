<?php

return [
  'queue' => env('OVERLAY_QUEUE', 'notifications'),
  'sse' => [
    'max_seconds' => (int) env('OVERLAY_SSE_MAX_SECONDS', 60),
    'sleep_us' => (int) env('OVERLAY_SSE_SLEEP_US', 500000),
    'heartbeat_seconds' => (int) env('OVERLAY_SSE_HEARTBEAT_SECONDS', 10),
  ],
];
